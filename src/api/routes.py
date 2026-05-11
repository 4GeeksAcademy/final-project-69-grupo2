"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from api.models import db, Reserva, User
from flask import jsonify, request, Blueprint, make_response
from flask import Flask, request, jsonify, url_for, Blueprint
from sqlalchemy.exc import IntegrityError
from api.utils import generate_sitemap, APIException, validate_email, send_email
from api.models import db, User, Categoria, Complejo, Cancha, Reserva, Role
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from base64 import b64encode
import os
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, JWTManager, get_jwt, decode_token
from datetime import timedelta
import cloudinary.uploader as cloudinary_upload
import stripe

# Configura tu clave secreta (está en tu Dashboard de Stripe)
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

api = Blueprint('api', __name__)
CORS(api)

ALLOWED_IMG_EXTENSIONS = {'image/png', 'image/jpg',
                          'image/jpeg', 'image/gif', 'image/webp'}
MAX_IMG_SIZE = 2 * 1024 * 1024  # 2MB


def _resolve_avatar_url(avatar_file):
    # Primero verificar si existe o es string vacío
    if not avatar_file or isinstance(avatar_file, str):
        return "https://i.pravatar.cc/300"

    if avatar_file.mimetype not in ALLOWED_IMG_EXTENSIONS:
        raise ValueError(
            "Invalid image format. Allowed formats: PNG, JPG, JPEG, GIF, WEBP")

    avatar_file.stream.seek(0, 2)
    file_size = avatar_file.stream.tell()
    avatar_file.stream.seek(0)

    if file_size > MAX_IMG_SIZE:
        raise ValueError("Image size exceeds the maximum limit of 2MB")

    return None  # Señal de que hay archivo válido para subir a Cloudinary


@api.route('/health-check', methods=["GET"])
def health_check():
    return jsonify({"status": "Ok"}), 200


@api.route('/users', methods=["POST"])
def create_user():
    data_form = request.form
    data_files = request.files
    data = {**data_form, **data_files}

    for field in ["email", "username", "full_name", "password"]:
        if not data.get(field):
            return jsonify({"error": f"Missing required field: {field}"}), 400

    email = data["email"].strip().lower()
    username = data["username"].strip()
    full_name = data["full_name"].strip()
    password = data["password"].strip()
    role_raw = data.get("role", "user")
    role_value = str(role_raw).strip().lower()
    avatar_file = data.get("avatar_url")

    if role_value not in {Role.USER.value, Role.ADMIN.value}:
        return jsonify({"error": "Invalid role. Allowed roles: user, admin"}), 400

    try:
        avatar_url = _resolve_avatar_url(avatar_file)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    # Si hay archivo válido (avatar_url es None), subir a Cloudinary
    if avatar_file and avatar_url is None:
        try:
            uploaded_result = cloudinary_upload.upload(
                avatar_file, folder="avatars")
            avatar_url = uploaded_result.get(
                "secure_url", "https://i.pravatar.cc/300")
        except Exception as e:
            return jsonify({"error": f"Error uploading avatar: {str(e)}"}), 500

    valid_email = validate_email(email)
    if not valid_email:
        return jsonify({"error": "Invalid email format"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already exists"}), 400

    salt = b64encode(os.urandom(32)).decode('utf-8')
    hashed_password = generate_password_hash(password + salt)

    try:
        new_user = User(
            email=email,
            username=username,
            password=hashed_password,
            salt=salt,
            role=Role(role_value),
            is_active=False,
            avatar_url=avatar_url,
            full_name=full_name)

        db.session.add(new_user)
        db.session.flush()

        frontend_url = (os.getenv("URL_FRONTEND") or "").strip()
        if not frontend_url:
            db.session.rollback()
            return jsonify({"error": "URL_FRONTEND is required"}), 500

        activation_token = create_access_token(
            identity=str(new_user.id),
            additional_claims={"purpose": "account_activation"},
            expires_delta=timedelta(hours=1)
        )

        activation_link = f"{frontend_url}activate-account?token={activation_token}"
        email_body = f"""
        <div>
            <p>Hola {new_user.username},</p>
            <p>Bienvenido! Por favor activa tu cuenta ingresando al siguiente enlace:</p>
            <a href="{activation_link}">Activar cuenta</a>
            <p>If you did not create this account, you can ignore this email.</p>
        </div>
        """

        success = send_email(
            subject="Activación de usuario",
            to=new_user.email,
            body=email_body
        )

        if not success:
            db.session.rollback()
            return jsonify({"error": "Failed to send activation email"}), 500

        db.session.commit()

        return jsonify({"message": "User created successfully"}), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except IntegrityError as e:
        db.session.rollback()
        return jsonify({"error": "Database integrity error: " + str(e)}), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "An error occurred while creating the user"}), 500


@api.route('/login', methods=["POST"])
def login():
    data = request.get_json()

    email = data.get("email", "").strip().lower()
    password = data.get("password", "").strip()

    for field in ["email", "password"]:
        if not data.get(field):
            return jsonify({"error": f"Missing required field: {field}"}), 400

    user = User.query.filter_by(email=email).one_or_none()
    if not user:
        return jsonify({"error": "Invalid email or password"}), 401

    if not check_password_hash(user.password, password + user.salt):
        return jsonify({"error": "Invalid email or password"}), 401

    return jsonify({"message": "Login successful",
                    "user": user.serialize(),
                    "access_token": create_access_token(identity=str(user.id),
                                                        expires_delta=timedelta(hours=1))}
                   ), 200


@api.route('/profile', methods=['GET'])
@jwt_required()
def profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"message": "This is the profile endpoint.",
                    "user": user.serialize()}), 200


@api.route('/users/<int:user_id>/reservas', methods=['GET'])
@jwt_required()
def get_user_reservas(user_id):
    """
    Obtiene el historial de reservas de un usuario.
    Solo el usuario mismo o un administrador puede acceder a sus reservas.
    """
    current_user_id = get_jwt_identity()
    current_user = User.query.get(int(current_user_id))

    # Verificar que el usuario exista
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404

    # Verificar permisos: solo el usuario o un admin pueden ver sus reservas
    if current_user.id != user_id and current_user.role != Role.ADMIN and current_user.role != Role.SUPER_ADMIN:
        return jsonify({"error": "No tiene permisos para ver estas reservas"}), 403

    # Obtener todas las reservas del usuario ordenadas por fecha descendente
    reservas = Reserva.query.filter_by(
        user_id=user_id, es_bloqueo=False).order_by(Reserva.fecha.desc()).all()

    return jsonify([res.serialize() for res in reservas]), 200


@api.route('/example-email', methods=['GET'])
def example_email():
    to = "bensirave@hotmail.com"
    subject = "Example Email"
    body = "<h1>This is an example email</h1>"
    if send_email(to, subject, body):
        return jsonify({"message": "Email sent successfully"}), 200
    else:
        return jsonify({"error": "Failed to send email"}), 500


@api.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    email = data.get("email", "").strip().lower()

    if not email:
        return jsonify({"error": "Missing required field: email"}), 400

    user = User.query.filter_by(email=email).one_or_none()
    if not user:
        return jsonify({"error": "If email exists, a password reset email will be sent"}), 404

    reset_token = create_access_token(
        identity=str(user.id),
        additional_claims={"purpose": "password-reset"},
        expires_delta=timedelta(minutes=10)
    )
    frontend_url = (os.getenv("URL_FRONTEND") or "").strip()

    if not frontend_url:
        return jsonify({"error": "Frontend URL is not configured"}), 500

    reset_base_url = frontend_url.rstrip("/") + "/recovery-password"
    reset_link = f"{reset_base_url}?token={reset_token}"

    subject = "Solicitud de restaurar la contraseña"

    body = f"""
        <div>
            <p>Hola {user.username},</p>
            <p>Solicitud para restaurar la contraseña. Da click en el siguiente enlace:</p>
            <a href="{reset_link}">Reset Password</a>
            <p>Si tu no solicitaste este enlace puedes ignorarlo.</p>
        </div>
    """

    try:
        success = send_email(
            to=user.email,
            subject=subject,
            body=body
        )
        if success:
            return jsonify({"message": "Email sending success"}), 200
        else:
            return jsonify({"error": "Error sending message"}), 500
    except Exception as error:
        return jsonify({"error": f"Error sending email: {error.args}"}), 500


@api.route("/update-pwd", methods=["POST"])
@jwt_required()
def update_password():
    claims = get_jwt()
    if claims.get("purpose") != "password-reset":
        return jsonify({"error": "Invalid token for password update"}), 403

    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()
    new_password = data.get("new_password", "")

    if not new_password:
        return jsonify({"error": "Missing required field: new_password"}), 400

    salt = b64encode(os.urandom(32)).decode("utf-8")
    user.password = generate_password_hash(new_password + salt)
    user.salt = salt

    try:
        db.session.commit()
        return jsonify({"message": "Password updated successfully"}), 200
    except Exception as error:
        db.session.rollback()
        return jsonify({"error": f"Error updating password: {error.args}"}), 500


@api.route("/activate-account", methods=["POST"])
def activate_account():
    data = request.get_json(silent=True) or {}
    token = (data.get("token") or request.args.get("token") or "").strip()

    if not token:
        return jsonify({"error": "Missing required field: token"}), 400

    try:
        decoded = decode_token(token)
    except Exception as error:
        return jsonify({"error": f"Invalid or expired token: {error.args}"}), 400

    if decoded.get("purpose") != "account_activation":
        return jsonify({"error": "Invalid token purpose"}), 403

    user_id = decoded.get("sub")
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    if user.is_active:
        return jsonify({"message": "User already activated"}), 200

    user.is_active = True

    try:
        db.session.commit()
        return jsonify({"message": "User activated successfully"}), 200
    except Exception as error:
        db.session.rollback()
        return jsonify({"error": f"Error activating user: {error.args}"}), 500


@api.route('/hello', methods=['GET'])
def handle_hello():
    return jsonify({"message": "Hello!"}), 200


@api.route('/categorias', methods=['GET'])
def get_categorias():
    categorias = Categoria.query.all()
    return jsonify([c.serialize() for c in categorias]), 200


@api.route('/complejos', methods=['GET'])
def get_complejos():
    complejos = Complejo.query.all()
    return jsonify([c.serialize() for c in complejos]), 200


@api.route('/mis-complejos', methods=['GET'])
@jwt_required()
def get_mis_complejos():
    current_user_id = get_jwt_identity()
    complejos = Complejo.query.filter_by(owner_id=int(current_user_id)).all()
    return jsonify([c.serialize() for c in complejos]), 200


@api.route('/complejo/<int:id>', methods=['GET'])
def get_complejo(id):
    complejo = Complejo.query.get(id)
    if not complejo:
        return jsonify({"error": "Complejo no encontrado"}), 404
    return jsonify(complejo.serialize()), 200


@api.route('/complejo', methods=['POST'])
@jwt_required()
def add_complejo():
    current_user_id = get_jwt_identity()
    # Recibimos del FormData (Frontend usa 'name')
    nombre = request.form.get("name")
    email = request.form.get("email")
    phone = request.form.get("phone")
    address = request.form.get("address")
    country = request.form.get("country")
    city = request.form.get("city")
    google_map = request.form.get("google_map")

    image_file = request.files.get("image")
    url_cloudinary = None

    if image_file:
        try:
            upload_result = cloudinary_upload.upload(
                image_file, folder="complejos")
            url_cloudinary = upload_result.get("secure_url")
        except Exception as e:
            return jsonify({"error": f"Error Cloudinary: {str(e)}"}), 500

    try:
        nuevo_complejo = Complejo(
            nombre=nombre,  # Usamos 'nombre' como dice tu clase
            email=email,
            phone=phone,
            address=address,
            country=country,
            city=city,
            google_map=google_map,
            imagen_url=url_cloudinary,  # Usamos 'imagen_url' como dice tu clase
            owner_id=int(current_user_id)
        )
        db.session.add(nuevo_complejo)
        db.session.commit()
        return jsonify(nuevo_complejo.serialize()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api.route('/complejo/<int:id>', methods=['PUT'])
@jwt_required()
def update_complejo(id):
    current_user_id = get_jwt_identity()
    complejo = Complejo.query.get(id)
    if not complejo:
        return jsonify({"error": "Complejo no encontrado"}), 404

    if complejo.owner_id != int(current_user_id) and User.query.get(current_user_id).role != Role.ADMIN:
        return jsonify({"error": "No tienes permiso para modificar este complejo"}), 403

    # IMPORTANTE: Usar los nombres exactos de tu modelo (nombre, country, city, etc.)
    complejo.nombre = request.form.get("name", complejo.nombre)
    complejo.email = request.form.get("email", complejo.email)
    complejo.phone = request.form.get("phone", complejo.phone)
    complejo.address = request.form.get("address", complejo.address)
    complejo.country = request.form.get("country", complejo.country)
    complejo.city = request.form.get("city", complejo.city)
    complejo.google_map = request.form.get("google_map", complejo.google_map)

    image_file = request.files.get("image")
    if image_file:
        try:
            upload_result = cloudinary_upload.upload(
                image_file, folder="complejos")
            complejo.imagen_url = upload_result.get(
                "secure_url")  # Nombre correcto
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    try:
        db.session.commit()
        return jsonify(complejo.serialize()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api.route('/complejo/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_complejo(id):
    current_user_id = get_jwt_identity()
    complejo = Complejo.query.get(id)
    if not complejo:
        return jsonify({"msg": "No existe"}), 404
    if complejo.owner_id != int(current_user_id) and User.query.get(current_user_id).role != Role.ADMIN:
        return jsonify({"error": "No tienes permiso para eliminar este complejo"}), 403
    db.session.delete(complejo)
    db.session.commit()
    return jsonify({"msg": "Eliminado"}), 200


@api.route('/canchas', methods=['GET'])
def get_canchas():
    complejo_id = request.args.get('complejo_id')
    categoria_nombre = request.args.get('categoria')

    query = Cancha.query

    if complejo_id:
        query = query.filter_by(complejo_id=complejo_id)

    if categoria_nombre:
        categoria = Categoria.query.filter_by(nombre=categoria_nombre).first()
        if categoria:
            query = query.filter_by(categoria_id=categoria.id)
        else:
            return jsonify([]), 200

    canchas = query.all()
    return jsonify([c.serialize() for c in canchas]), 200


@api.route('/cancha/<int:id>', methods=['GET'])
def get_cancha(id):
    cancha = Cancha.query.get(id)
    if not cancha:
        return jsonify({"msg": "Cancha no encontrada"}), 404
    return jsonify(cancha.serialize()), 200


@api.route('/reservas/horarios', methods=['GET'])
def get_horarios():
    cancha_id = request.args.get('cancha_id')
    fecha = request.args.get('fecha')
    if not cancha_id or not fecha:
        return jsonify({"error": "Faltan parámetros"}), 400
    reservas = Reserva.query.filter_by(cancha_id=cancha_id, fecha=fecha).all()
    ocupados = [r.hora for r in reservas]
    return jsonify({"ocupados": ocupados}), 200


@api.route('/reservas', methods=['POST'])
@jwt_required()
def crear_reserva():
    current_user_id = get_jwt_identity()
    body = request.get_json()
    cancha_id = body.get('cancha_id')
    fecha = body.get('fecha')
    hora = body.get('hora')
    if not cancha_id or not fecha or not hora:
        return jsonify({"error": "Faltan campos requeridos"}), 400
    reserva_existente = Reserva.query.filter_by(
        cancha_id=cancha_id, fecha=fecha, hora=hora
    ).first()
    if reserva_existente:
        return jsonify({"error": "Ese horario ya está ocupado"}), 409
    nueva_reserva = Reserva(
        cancha_id=cancha_id,
        fecha=fecha,
        hora=hora,
        user_id=int(current_user_id),
        estado="pendiente"
    )
    db.session.add(nueva_reserva)
    db.session.commit()
    return jsonify(nueva_reserva.serialize()), 201


@api.route('/reservas/<int:id>', methods=['PUT'])
@jwt_required()
def actualizar_reserva(id):
    reserva = Reserva.query.get(id)
    if not reserva:
        return jsonify({"error": "Reserva no encontrada"}), 404
    body = request.get_json()
    reserva.estado = body.get('estado', reserva.estado)
    db.session.commit()
    return jsonify(reserva.serialize()), 200


@api.route('/cancha', methods=['POST'])
def add_cancha():
    nombre = request.form.get("nombre")
    complejo_id = request.form.get("complejo_id")
    categoria_id = request.form.get("categoria_id")
    precio_hora = request.form.get("precio_hora")

    image_file = request.files.get("image")
    url_cloudinary = None

    if image_file:
        upload_result = cloudinary_upload.upload(image_file, folder="canchas")
        url_cloudinary = upload_result.get("secure_url")

    try:
        nueva_cancha = Cancha(
            nombre=nombre,
            complejo_id=complejo_id,
            categoria_id=categoria_id,
            precio_hora=float(precio_hora) if precio_hora else None,
            foto_url=url_cloudinary
        )
        db.session.add(nueva_cancha)
        db.session.commit()
        return jsonify(nueva_cancha.serialize()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api.route('/cancha/<int:id>', methods=['DELETE'])
def delete_cancha(id):
    cancha = Cancha.query.get(id)

    if not cancha:
        return jsonify({"msg": "La cancha no existe"}), 404

    try:
        db.session.delete(cancha)
        db.session.commit()
        return jsonify({"msg": f"Cancha {id} eliminada correctamente"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error al eliminar la cancha", "error": str(e)}), 500

    # Obtener todas las reservas de una cancha específica


@api.route('/reservas/<int:cancha_id>', methods=['GET'])
def get_reservas_cancha(cancha_id):
    reservas = Reserva.query.filter_by(cancha_id=cancha_id).all()
    return jsonify([res.serialize() for res in reservas]), 200

# Crear una nueva reserva o un bloqueo


# ... tus otros imports ...


@api.route('/reserva', methods=['POST', 'OPTIONS'])
def add_reserva():
    # ✅ Manejo de Preflight CORS
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "*")
        response.headers.add('Access-Control-Allow-Methods', "POST, OPTIONS")
        return response, 200

    data = request.get_json()
    es_bloqueo = data.get("es_bloqueo", False)
    user_id = data.get("user_id")

    # Validaciones básicas
    if not data.get("fecha") or not data.get("hora") or not data.get("cancha_id"):
        return jsonify({"error": "Faltan datos obligatorios"}), 400

    nueva_reserva = Reserva(
        fecha=data.get("fecha"),
        hora=data.get("hora"),
        cancha_id=data.get("cancha_id"),
        es_bloqueo=es_bloqueo,
        user_id=user_id,
        estado="confirmado" if es_bloqueo else "pendiente"
    )

    try:
        db.session.add(nueva_reserva)
        db.session.commit()
        resp = jsonify(nueva_reserva.serialize())
        resp.headers.add("Access-Control-Allow-Origin",
                         "*")  # ✅ Header necesario
        return resp, 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api.route('/reserva/<int:id>', methods=['DELETE', 'OPTIONS'])
def delete_reserva(id):
    # ✅ Manejo de Preflight CORS
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "*")
        response.headers.add('Access-Control-Allow-Methods', "DELETE, OPTIONS")
        return response, 200

    reserva = Reserva.query.get(id)
    if not reserva:
        return jsonify({"msg": "No existe"}), 404

    try:
        db.session.delete(reserva)
        db.session.commit()
        resp = jsonify({"msg": "Horario liberado"})
        resp.headers.add("Access-Control-Allow-Origin",
                         "*")  # ✅ Header necesario
        return resp, 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api.route('/admin/reportes', methods=['GET'])
@jwt_required()
def get_admin_reports():
    """
    Obtiene un reporte de reservas para administración.
        Solo admin y super_admin pueden acceder a este endpoint.
        El admin ve reservas de sus complejos.
        El super_admin ve reservas de todos los complejos.

        Query parameters:
        - complejo_id (int): Filtrar por ID de complejo
        - cancha_id (int): Filtrar por ID de cancha
        - fecha (str): Filtrar por fecha (YYYY-MM-DD)
        - fecha_inicio (str): Fecha inicio rango (YYYY-MM-DD)
        - fecha_fin (str): Fecha fin rango (YYYY-MM-DD)
        - estado (str): Filtrar por estado (pendiente, confirmada, cancelada)
    """
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(int(current_user_id))

        if not current_user:
            return jsonify({"error": "Usuario no encontrado"}), 404

        # Verificar que sea admin o super_admin
        if current_user.role not in [Role.ADMIN, Role.SUPER_ADMIN]:
            return jsonify({"error": "Acceso denegado. Solo administradores pueden ver reportes"}), 403

        # Obtener parámetros de filtro
        complejo_id = request.args.get("complejo_id", type=int)
        cancha_id = request.args.get("cancha_id", type=int)
        fecha = request.args.get("fecha", type=str)
        fecha_inicio = request.args.get("fecha_inicio", type=str)
        fecha_fin = request.args.get("fecha_fin", type=str)
        estado = request.args.get("estado", type=str)

        is_super_admin = current_user.role == Role.SUPER_ADMIN

        # Construir query base
        query = db.session.query(Reserva).join(Cancha).filter(
            Reserva.es_bloqueo == False  # Excluir bloqueos
        )

        # Si es admin normal, limitar a sus complejos
        admin_complejo_ids = []
        if not is_super_admin:
            admin_complejos = Complejo.query.filter_by(
                owner_id=current_user.id).all()
            admin_complejo_ids = [c.id for c in admin_complejos]

            if not admin_complejo_ids:
                return jsonify([]), 200  # Sin complejos, sin reservas

            query = query.filter(Cancha.complejo_id.in_(admin_complejo_ids))

        # Aplicar filtros
        if complejo_id:
            # Verificar ownership solo para admin normal
            if not is_super_admin and complejo_id not in admin_complejo_ids:
                return jsonify({"error": "No tienes acceso a este complejo"}), 403
            query = query.filter(Cancha.complejo_id == complejo_id)

        if cancha_id:
            cancha = Cancha.query.get(cancha_id)
            if not cancha:
                return jsonify({"error": "Cancha no encontrada"}), 404
            # Verificar ownership solo para admin normal
            if not is_super_admin and cancha.complejo_id not in admin_complejo_ids:
                return jsonify({"error": "No tienes acceso a esta cancha"}), 403
            query = query.filter(Reserva.cancha_id == cancha_id)

        if fecha:
            query = query.filter(Reserva.fecha == fecha)

        if fecha_inicio and fecha_fin:
            query = query.filter(
                Reserva.fecha >= fecha_inicio,
                Reserva.fecha <= fecha_fin
            )
        elif fecha_inicio:
            query = query.filter(Reserva.fecha >= fecha_inicio)
        elif fecha_fin:
            query = query.filter(Reserva.fecha <= fecha_fin)

        if estado:
            query = query.filter(Reserva.estado == estado)

        # Ejecutar query y ordenar por fecha descendente
        reservas = query.order_by(
            Reserva.fecha.desc(), Reserva.hora.desc()).all()

        return jsonify([res.serialize() for res in reservas]), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route('/admin/reportes/estadisticas', methods=['GET'])
@jwt_required()
def get_admin_statistics():
    """
    Obtiene estadísticas de reservas para administración.
    Admin: solo sus complejos. Super admin: todos los complejos.
    """
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(int(current_user_id))

        if not current_user:
            return jsonify({"error": "Usuario no encontrado"}), 404

        # Verificar que sea admin o super_admin
        if current_user.role not in [Role.ADMIN, Role.SUPER_ADMIN]:
            return jsonify({"error": "Acceso denegado. Solo administradores"}), 403

        # Obtener parámetros
        fecha_inicio = request.args.get("fecha_inicio", type=str)
        fecha_fin = request.args.get("fecha_fin", type=str)

        is_super_admin = current_user.role == Role.SUPER_ADMIN

        # Query base
        query = db.session.query(Reserva).join(Cancha).filter(
            Reserva.es_bloqueo == False
        )

        if not is_super_admin:
            admin_complejos = Complejo.query.filter_by(
                owner_id=current_user.id).all()
            admin_complejo_ids = [c.id for c in admin_complejos]

            if not admin_complejo_ids:
                return jsonify({
                    "total_reservas": 0,
                    "confirmadas": 0,
                    "pendientes": 0,
                    "canceladas": 0,
                    "por_complejo": [],
                    "por_cancha": [],
                    "por_dia": []
                }), 200

            query = query.filter(Cancha.complejo_id.in_(admin_complejo_ids))

        # Aplicar rango de fechas
        if fecha_inicio and fecha_fin:
            query = query.filter(
                Reserva.fecha >= fecha_inicio,
                Reserva.fecha <= fecha_fin
            )
        elif fecha_inicio:
            query = query.filter(Reserva.fecha >= fecha_inicio)
        elif fecha_fin:
            query = query.filter(Reserva.fecha <= fecha_fin)

        reservas = query.all()

        # Calcular estadísticas
        total = len(reservas)
        confirmadas = sum(1 for r in reservas if r.estado == "confirmada")
        pendientes = sum(1 for r in reservas if r.estado == "pendiente")
        canceladas = sum(1 for r in reservas if r.estado == "cancelada")

        # Por complejo
        por_complejo = {}
        for r in reservas:
            complejo_nombre = r.cancha.complejo.nombre if r.cancha and r.cancha.complejo else "Sin complejo"
            if complejo_nombre not in por_complejo:
                por_complejo[complejo_nombre] = {
                    "total": 0, "confirmadas": 0}
            por_complejo[complejo_nombre]["total"] += 1
            if r.estado == "confirmada":
                por_complejo[complejo_nombre]["confirmadas"] += 1

        # Por cancha
        por_cancha = {}
        for r in reservas:
            cancha_nombre = r.cancha.nombre if r.cancha else "Sin cancha"
            if cancha_nombre not in por_cancha:
                por_cancha[cancha_nombre] = {"total": 0, "confirmadas": 0}
            por_cancha[cancha_nombre]["total"] += 1
            if r.estado == "confirmada":
                por_cancha[cancha_nombre]["confirmadas"] += 1

        # Por día
        por_dia = {}
        for r in reservas:
            fecha = r.fecha
            if fecha not in por_dia:
                por_dia[fecha] = {"total": 0, "confirmadas": 0}
            por_dia[fecha]["total"] += 1
            if r.estado == "confirmada":
                por_dia[fecha]["confirmadas"] += 1

        return jsonify({
            "total_reservas": total,
            "confirmadas": confirmadas,
            "pendientes": pendientes,
            "canceladas": canceladas,
            "por_complejo": por_complejo,
            "por_cancha": por_cancha,
            "por_dia": por_dia
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route('/admin/complejos', methods=['GET'])
@jwt_required()
def get_admin_complejos():
    """
    Obtiene complejos según el rol autenticado.
    Admin: sus complejos. Super admin: todos los complejos.
    """
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(int(current_user_id))

        if not current_user:
            return jsonify({"error": "Usuario no encontrado"}), 404

        # Verificar que sea admin o super_admin
        if current_user.role not in [Role.ADMIN, Role.SUPER_ADMIN]:
            return jsonify({"error": "Acceso denegado"}), 403

        if current_user.role == Role.SUPER_ADMIN:
            complejos = Complejo.query.all()
        else:
            complejos = Complejo.query.filter_by(
                owner_id=current_user.id).all()

        complejos_con_canchas = []
        for complejo in complejos:
            complejo_data = complejo.serialize()
            complejo_data["canchas"] = [
                {"id": cancha.id, "nombre": cancha.nombre}
                for cancha in complejo.canchas
            ]
            complejos_con_canchas.append(complejo_data)

        return jsonify(complejos_con_canchas), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route('/admin/usuarios', methods=['GET'])
@jwt_required()
def get_admin_users():
    """
    Listado de usuarios para gestión del super_admin.
    """
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(int(current_user_id))

        if not current_user:
            return jsonify({"error": "Usuario no encontrado"}), 404

        if current_user.role != Role.SUPER_ADMIN:
            return jsonify({"error": "Acceso denegado. Solo super_admin"}), 403

        users = User.query.order_by(User.create_at.desc()).all()
        return jsonify([u.serialize() for u in users]), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route('/admin/usuarios/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_admin_user(user_id):
    """
    Permite al super_admin actualizar rol (admin/user) y estado activo.
    """
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(int(current_user_id))

        if not current_user:
            return jsonify({"error": "Usuario no encontrado"}), 404

        if current_user.role != Role.SUPER_ADMIN:
            return jsonify({"error": "Acceso denegado. Solo super_admin"}), 403

        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "Usuario no encontrado"}), 404

        data = request.get_json(silent=True) or {}
        role_value = data.get("role", None)
        is_active = data.get("is_active", None)

        if role_value is None and is_active is None:
            return jsonify({"error": "Debes enviar role o is_active"}), 400

        if user.id == int(current_user_id):
            return jsonify({"error": "No puedes modificar tu propio usuario desde este panel"}), 400

        if user.role == Role.SUPER_ADMIN:
            return jsonify({"error": "No se puede modificar otro super_admin"}), 400

        if role_value is not None:
            role_value = str(role_value).strip().lower()
            if role_value not in [Role.ADMIN.value, Role.USER.value]:
                return jsonify({"error": "Rol inválido. Usa admin o user"}), 400
            user.role = Role(role_value)

        if is_active is not None:
            if isinstance(is_active, bool):
                user.is_active = is_active
            elif isinstance(is_active, str):
                parsed = is_active.strip().lower()
                if parsed in ["true", "1", "si", "sí"]:
                    user.is_active = True
                elif parsed in ["false", "0", "no"]:
                    user.is_active = False
                else:
                    return jsonify({"error": "is_active inválido"}), 400
            else:
                return jsonify({"error": "is_active debe ser boolean"}), 400

        db.session.commit()
        return jsonify(user.serialize()), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api.route('/create-checkout-session', methods=['POST', 'OPTIONS'])
def create_checkout_session():
    if request.method == 'OPTIONS':
        return '', 200

    try:
        data = request.json
        reserva_id = data.get('reserva_id')
        nombre_pago = data.get('nombre', 'Reserva de Cancha')

        # Identificar el tipo de pago para la metadata
        tipo_pago = "total" if "Total" in nombre_pago else "senia"

        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            # ✅ Guardamos el ID en client_reference_id para asegurar la compatibilidad
            client_reference_id=reserva_id,
            # ✅ Guardamos info extra en metadata
            metadata={
                "reserva_id": reserva_id,
                "tipo_pago": tipo_pago
            },
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': nombre_pago
                    },
                    'unit_amount': int(float(data.get('precio', 0)) * 100),
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=data['success_url'] +
            "?session_id={CHECKOUT_SESSION_ID}",
            cancel_url=data['cancel_url'],
        )
        return jsonify({'url': checkout_session.url}), 200

    except Exception as e:
        print(f"Error en Stripe Session: {str(e)}")
        return jsonify(error=str(e)), 403


@api.route('/confirmar-pago', methods=['POST'])
def confirmar_pago():
    data = request.get_json()
    session_id = data.get("session_id")

    try:
        # 1. Recuperamos la sesión de Stripe
        session = stripe.checkout.Session.retrieve(session_id)

        # 2. Extraemos el ID de la reserva de forma segura
        # Intentamos sacarlo de 'client_reference_id' y si no, de 'metadata'
        reserva_id = getattr(session, 'client_reference_id', None)
        if not reserva_id and hasattr(session, 'metadata'):
            reserva_id = session.metadata.get("reserva_id")

        if not reserva_id:
            print("❌ Error: No se encontró reserva_id en la sesión de Stripe")
            return jsonify({"success": False, "error": "ID de reserva ausente"}), 400

        # 3. Buscamos la reserva en la base de datos
        reserva = Reserva.query.get(reserva_id)
        if not reserva:
            print(f"❌ Error: La reserva {reserva_id} no existe en la DB")
            return jsonify({"success": False, "error": "Reserva no encontrada"}), 404

        # 4. Actualizamos y guardamos
        if session.payment_status == "paid":
            reserva.estado = "pagado"
            reserva.monto_pagado = session.amount_total / 100
            db.session.commit()

            # 5. Enviar notificaciones por email (sin bloquear la confirmación de pago)
            cancha = reserva.cancha
            complejo = cancha.complejo if cancha else None
            usuario = reserva.user
            owner = complejo.owner if complejo else None

            cancha_nombre = cancha.nombre if cancha else "Cancha no disponible"
            complejo_nombre = complejo.nombre if complejo else "Complejo no disponible"

            detalle_reserva_html = f"""
                <ul>
                    <li><strong>ID Reserva:</strong> {reserva.id}</li>
                    <li><strong>Complejo:</strong> {complejo_nombre}</li>
                    <li><strong>Cancha:</strong> {cancha_nombre}</li>
                    <li><strong>Fecha:</strong> {reserva.fecha}</li>
                    <li><strong>Hora:</strong> {reserva.hora}</li>
                    <li><strong>Monto pagado:</strong> USD {reserva.monto_pagado:.2f}</li>
                    <li><strong>Estado:</strong> {reserva.estado}</li>
                </ul>
            """

            if usuario and usuario.email:
                user_subject = "Reserva confirmada - Pago recibido"
                user_body = f"""
                    <div>
                        <p>Hola {usuario.username},</p>
                        <p>Tu reserva fue confirmada correctamente.</p>
                        {detalle_reserva_html}
                    </div>
                """
                sent_to_user = send_email(
                    to=usuario.email,
                    subject=user_subject,
                    body=user_body
                )
                if not sent_to_user:
                    print(
                        f"Warning: no se pudo enviar email al usuario {usuario.email}")

            if owner and owner.email:
                owner_subject = "Nueva reserva confirmada en tu complejo"
                owner_body = f"""
                    <div>
                        <p>Hola {owner.username},</p>
                        <p>Se confirmó una nueva reserva en tu complejo.</p>
                        {detalle_reserva_html}
                        <p><strong>Usuario:</strong> {usuario.username if usuario else 'No disponible'}</p>
                        <p><strong>Email usuario:</strong> {usuario.email if usuario else 'No disponible'}</p>
                    </div>
                """
                sent_to_owner = send_email(
                    to=owner.email,
                    subject=owner_subject,
                    body=owner_body
                )
                if not sent_to_owner:
                    print(
                        f"Warning: no se pudo enviar email al propietario {owner.email}")

            print(f"✅ ¡ÉXITO! Reserva {reserva_id} actualizada correctamente")

            return jsonify({
                "success": True,
                "cancha": "Confirmada"
            }), 200
        else:
            return jsonify({"success": False, "error": "El pago no está aprobado"}), 400

    except Exception as e:
        db.session.rollback()
        # Aquí imprimiremos el error exacto para que lo veas en la terminal
        print(f"DEBUG ERROR: {str(e)}")
        return jsonify({"success": False, "error": "Error interno del servidor"}), 500
