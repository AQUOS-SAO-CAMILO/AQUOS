from flask import Blueprint, jsonify, request
from backend.src.services.user_service import authenticate_user_logic, register_user_logic, list_all_users_logic, update_user_data_logic, delete_user_logic

# criando o bluesprint 
login = Blueprint('login', __name__)

# Endpoint para autenticar o login
@login.route('/login', methods=['POST'])

def authenticate_user():

    data = request.get_json()
    user = data.get('user')
    password = data.get('password')

    # Verificação dos dados fornecidos
    if not user or not password:
        return jsonify({"error": "Usuário e senha são obriatórios."}), 400
    
    try:
        # Gerar token
        token = authenticate_user_logic(user, password)
       
        return jsonify({
            "message": "Autenticação bem-sucedida",
            "token": token,}), 200
    
    except Exception as e:
        return jsonify({"error": f"Erro ao autenticar o usuário: {e}"}), 500
    
# Endpoint de registro do usuário 
@login.route('/register', methods=['POST'])
def register_user():

    data = request.get_json()
    user = data.get('user')
    password = data.get('password')

    if not user or not password:
        return jsonify({"error": "Preencha todos os campos!"}), 400
    
    try:
        result = register_user_logic(user, password)
        return jsonify(result), 201
    except Exception as e:
        return jsonify({"error": f"Erro ao tentar criar novo usuário, {e}"}), 400
    
# Endpoint de busca de usuários
@login.route('/list', methods=['GET'])
def list_all_users():
    
    try:
        result = list_all_users_logic()
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": f"Erro ao tentar buscar usuários, {e}"}), 400
    
# Endpoint de atualizar as informações do usuário
@login.route('/update-user', methods=['PUT'])
def update_user_data():

    data = request.get_json()
    user_id = data.get('id')
    new_user = data.get('user')
    new_password = data.get('password')

    if not user_id:
        return jsonify({"error": "Id do usuário precisa ser preenchido!"}), 400

    if not new_password and not new_user:
        return jsonify({"error": "Forneça o usuário ou senha para atualização de dados."}), 400
        
    try:
        result = update_user_data_logic(user_id, new_user, new_password)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": f"Erro ao tentar atualizar dados do usuário, {e}"}), 400

# Endpoint de deletar o usuário
@login.route('/delete', methods=['DELETE'])
def delete_user():

    data = request.get_json()
    user_id = data.get('id')

    if not user_id:
        return jsonify({"error": "Id precisa ser fornecido!"}), 400
    
    try:
        result = delete_user_logic(user_id)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": f"Erro ao tentar deletar usuário do sistema, {e}"})
