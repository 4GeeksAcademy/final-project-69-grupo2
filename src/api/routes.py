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