from flask import request, jsonify, Blueprint
from api.models import db, User, Categoria, Complejo, Cancha
from api.utils import APIException
from flask_cors import CORS

api = Blueprint('api', __name__)
CORS(api)

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

@api.route('/complejo/<int:id>', methods=['GET'])
def get_complejo(id):
    complejo = Complejo.query.get(id)
    if not complejo:
        return jsonify({"error": "Complejo no encontrado"}), 404
    return jsonify(complejo.serialize()), 200

@api.route('/complejo', methods=['POST'])
def add_complejo():
    body = request.get_json()
    nuevo_complejo = Complejo(
        nombre=body.get('name'),
        email=body.get('email'),
        phone=body.get('phone'),
        address=body.get('address'),
        country=body.get('country'),
        city=body.get('city'),
        google_map=body.get('google_map'),
        categoria_id=body.get('categoria_id') 
    )
    db.session.add(nuevo_complejo)
    db.session.commit()
    return jsonify({"msg": "Complejo creado", "id": nuevo_complejo.id}), 201

@api.route('/complejo/<int:id>', methods=['PUT'])
def update_complejo(id):
    complejo = Complejo.query.get(id)
    if not complejo: return jsonify({"msg": "No existe"}), 404
    body = request.get_json()
    
   
    complejo.nombre = body.get('name', complejo.nombre)
    complejo.email = body.get('email', complejo.email)
    complejo.phone = body.get('phone', complejo.phone)
    complejo.address = body.get('address', complejo.address)
    complejo.country = body.get('country', complejo.country)
    complejo.city = body.get('city', complejo.city)          
    complejo.google_map = body.get('google_map', complejo.google_map)
    
    db.session.commit()
    return jsonify(complejo.serialize()), 200

@api.route('/complejo/<int:id>', methods=['DELETE'])
def delete_complejo(id):
    complejo = Complejo.query.get(id)
    if not complejo: return jsonify({"msg": "No existe"}), 404
    db.session.delete(complejo)
    db.session.commit()
    return jsonify({"msg": "Eliminado"}), 200



@api.route('/canchas', methods=['GET'])
def get_canchas():
    complejo_id = request.args.get('complejo_id')
    canchas = Cancha.query.filter_by(complejo_id=complejo_id).all()
    return jsonify([c.serialize() for c in canchas]), 200