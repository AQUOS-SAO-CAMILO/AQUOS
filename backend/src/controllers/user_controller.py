from flask import Blueprint, jsonify, request
from backend.src.services.user_service import authenticate_user_logic, register_user_logic, list_all_users_logic, update_user_data_logic, delete_user_logic
import logging

log = logging.getLogger("meuapp")

# criando o bluesprint 
login = Blueprint('login', __name__)

# Endpoint para autenticar o login
@login.route('/login', methods=['POST'])

def authenticate_user():

    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    log.debug("Requisição de autenticação recebida. email=%s", email)

    # Verificação dos dados fornecidos
    if not email or not password:
        log.warning("Email ou senha ausentes na requisição de autenticação.")
        return jsonify({"error": "Usuário e email são obriatórios."}), 400
    
    try:
        # Gerar token
        token = authenticate_user_logic(email, password)
        log.info("Autenticação realizada com sucesso. email=%s", email)
       
        if "error" in token:
            log.warning("Falha na autenticação. email=%s | Erro: %s", email, token["error"])
            return jsonify({"error": token["error"]}), 401

        return jsonify(token), 200
    
    except Exception as e:
        log.error("Erro ao autenticar usuário. email=%s | Erro: %s", email, e)
        return jsonify({"error": f"Erro ao autenticar o usuário: {e}"}), 500
    
# Endpoint de registro do usuário 
@login.route('/register', methods=['POST'])
def register_user():

    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    role = data.get('role', 'athlete')

    log.debug("Requisição de registro de usuário recebida. email=%s | role=%s", email, role)

    if not email or not password or not name:
        log.warning("Campos obrigatórios ausentes na requisição de registro. email=%s", email)
        return jsonify({"error": "Preencha todos os campos!"}), 400
    
    try:
        result = register_user_logic(email, password, name, role)
        log.info("Usuário registrado com sucesso. email=%s | role=%s", email, role)
        return jsonify(result), 201
    except Exception as e:
        log.error("Erro ao registrar usuário. email=%s | Erro: %s", email, e)
        return jsonify({"error": f"Erro ao tentar criar novo usuário, {e}"}), 400
    
# Endpoint de busca de usuários
@login.route('/list', methods=['GET'])
def list_all_users():

    log.debug("Requisição de listagem de usuários recebida.")
    
    try:
        result = list_all_users_logic()
        log.info("Listagem de usuários realizada com sucesso.")
        return jsonify(result), 200
    except Exception as e:
        log.error("Erro ao listar usuários. Erro: %s", e)
        return jsonify({"error": f"Erro ao tentar buscar usuários, {e}"}), 400
    
# Endpoint de atualizar as informações do usuário
@login.route('/update-user', methods=['PUT'])
def update_user_data():

    data = request.get_json()
    user_id = data.get('id')
    new_email = data.get('email')
    new_password = data.get('password')
    new_name = data.get('name')

    log.debug("Requisição de atualização de usuário recebida. user_id=%s", user_id)

    if not user_id:
        log.warning("Id do usuário não informado na requisição de atualização.")
        return jsonify({"error": "Id precisa ser preenchidos."}), 400

    if not new_password and not new_email and not new_name:
        log.warning("Nenhum campo de atualização informado na requisição. user_id=%s", user_id)
        return jsonify({"error": "Forneça ao menos um campo (email, nome ou senha) para atualização de dados."}), 400
        
    try:
        result = update_user_data_logic(user_id, new_email, new_password, new_name)
        log.info("Dados do usuário atualizados com sucesso. user_id=%s", user_id)
        return jsonify(result), 200
    except Exception as e:
        log.error("Erro ao atualizar dados do usuário. user_id=%s | Erro: %s", user_id, e)
        return jsonify({"error": f"Erro ao tentar atualizar dados do usuário, {e}"}), 400

# Endpoint de deletar o usuário
@login.route('/delete', methods=['PUT'])
def delete_user():

    data = request.get_json()
    user_id = data.get('id')

    log.debug("Requisição de desativação de usuário recebida. user_id=%s", user_id)

    if not user_id:
        log.warning("Id do usuário não informado na requisição de desativação.")
        return jsonify({"error": "Id precisa ser fornecido!"}), 400
    
    try:
        result = delete_user_logic(user_id)
        log.info("Usuário desativado com sucesso. user_id=%s", user_id)
        return jsonify(result), 200
    except Exception as e:
        log.error("Erro ao desativar usuário. user_id=%s | Erro: %s", user_id, e)
        return jsonify({"error": f"Erro ao tentar deletar usuário do sistema, {e}"}), 400    