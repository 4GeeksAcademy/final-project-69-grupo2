"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from sqlalchemy.exc import IntegrityError
from api.utils import generate_sitemap, APIException, validate_email, send_email
from api.models import db, User, Categoria, Complejo, Cancha
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from base64 import b64encode
import os
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, JWTManager, get_jwt, decode_token
from datetime import timedelta
import cloudinary.uploader as cloudinary_upload

api = Blueprint('api', __name__)
CORS(api)

ALLOWED_IMG_EXTENSIONS = {'image/png', 'image/jpg',
                          'image/jpeg', 'image/gif', 'image/webp'}
MAX_IMG_SIZE = 2 * 1024 * 1024  # 2MB


def _resolve_avatar_url(avatar_file):
    if avatar_file.mimetype not in ALLOWED_IMG_EXTENSIONS:
        raise ValueError(
            "Invalid image format. Allowed formats: PNG, JPG, JPEG, GIF, WEBP")

    if len(avatar_file.read()) > MAX_IMG_SIZE:
        raise ValueError("Image size exceeds the maximum limit of 2MB")

    if not avatar_file:
        return "https://i.pravatar.cc/300"

    avatar_file.stream.seek(0, 2)
    file_size = avatar_file.stream.tell()
    avatar_file.stream.seek(0)

    return "https://i.pravatar.cc/300"


@api.route('/health-check', methods=["GET"])
def health_check():

    return jsonify({"status": "Ok"}), 200


@api.route('/users', methods=["POST"])
def create_user():
    data_form = request.form
    data_files = request.files
    data = {**data_form, **data_files}

    for field in ["email", "username", "password"]:
        if not data.get(field):
            return jsonify({"error": f"Missing required field: {field}"}), 400

    email = data["email"].strip().lower()
    username = data["username"].strip()
    password = data["password"].strip()
    avatar_file = data.get("avatar_url")
    avatar_url = _resolve_avatar_url(avatar_file)

    if avatar_file:
        try:
            uploaded_result = cloudinary_upload.upload(
                avatar_file, folder="avatars")
            avatar = uploaded_result.get("secure_url", avatar_url)
        except ValueError as e:
            return jsonify({"error": str(e)}), 500

    valid_email = validate_email(email)
    if not valid_email:
        return jsonify({"error": "Invalid email format"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already exists"}), 400

    salt = b64encode(os.urandom(32)).decode('utf-8')
    password = generate_password_hash(password+salt)

    try:
        new_user = User(
            email=email,
            username=username,
            password=password,
            salt=salt,
            is_active=True,
            avatar_url=avatar_url)

        db.session.add(new_user)
        db.session.commit()

        return jsonify({"message": "User created successfully"}), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except IntegrityError as e:
        db.session.rollback()
        return jsonify({"error": "Database integrity error: " + str(e)}), 409
    except Exception as e:
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

    reset_token = create_access_token(identity=str(
        user.id), additional_claims={"purpose": "password-reset"}, expires_delta=timedelta(minutes=10))
    frontend_url = os.getenv("URL_FRONTEND" or "").strip()

    if not frontend_url:
        return jsonify({"error": "Frontend URL is not configured"}), 500

    reset_link = f"{frontend_url}reset-password?token={reset_token}"

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
            return jsonify({"error": "Error sended message"})
    except Exception as error:
        return jsonify({"error": f"Error sending email: {error.args}"})


@api.route("/update-pwd", methods=["POST"])
@jwt_required()
def update_password():
    claims = get_jwt()
    if claims.get("purpose") != "password-reset":
        return jsonify({"error": "Invalid tokoken for password update"}), 403

    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()
    new_password = data.get("new_password", "")

    if not new_password:
        return jsonify({"error": "Misssing required field: new_password"}), 400

    salt = b64encode(os.urandom(32)).decode("utf-8")
    user.password = generate_password_hash(new_password+salt)
    user.salt = salt

    try:
        db.session.commit()
        return jsonify({"message": "password updated successfully"}), 200
    except Exception as error:
        db.session.rollback()
        print(error.args)
        return jsonify({"error": f"Error updating password: {error.args}"}), 500


@api.route("/activate-account", methods=["POST"])
def activate_account():
    data = request.get_json(silent=True) or {}
    token = (data.get("token") or request.args.get("token") or "").strip()

    if not token:
        return jsonify({"error": "Missing required field. token"}), 400

    try:
        decoded = decode_token(token)

    except Exception as error:
        return jsonify({"error": f"Invalid token or expired token: {error.args}"}), 400

    if decoded.get("purpose") != "account_activation":
        return jsonify({"error": "Ivalid token purpose"}), 403

    user_id = decoded.get("sub")
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "user not found"}), 404

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
    categoria = request.args.get('categoria')
    if categoria:
        complejos = Complejo.query.join(Categoria).\
            filter(Categoria.nombre == categoria).all()
    else:
        complejos = Complejo.query.all()
    return jsonify([c.serialize() for c in complejos]), 200


@api.route('/complejos/<int:id>', methods=['GET'])
def get_complejo(id):
    complejo = Complejo.query.get(id)
    if not complejo:
        return jsonify({"error": "Complejo no encontrado"}), 404
    return jsonify(complejo.serialize()), 200


@api.route('/canchas', methods=['GET'])
def get_canchas():
    complejo_id = request.args.get('complejo_id')
    categoria = request.args.get('categoria')
    canchas = Cancha.query.filter_by(complejo_id=complejo_id).all()
    return jsonify([c.serialize() for c in canchas]), 200
