from backend.src.config.connection import create_connection
from backend.src.DAOS.user_DAO import *

import jwt
import logging
from flask import current_app
import datetime
from werkzeug.security import generate_password_hash, check_password_hash

log = logging.getLogger("meuapp")

def authenticate_user_logic(email, password):
    try:
        found_user_result = get_all_users_by_email(email)

        if not found_user_result:
            raise ValueError("Usuário não encontrado")
        
        user_id = found_user_result[0]
        user_email = found_user_result[1]
        password_hash = found_user_result[2]
        username = found_user_result[3]
        user_role = found_user_result[4]

        if not check_password_hash(password_hash, password):
            log.warning("Tentativa de autenticação com senha incorreta. user_id=%s", user_id)
            raise ValueError("Senha incorreta")
        
        is_admin = 1 if user_role in ['nutritionist', 'trainer', 'physician', 'admin'] else 0
        
        token = jwt.encode({
            "User_id": user_id,
            "email": user_email,
            "name": username,
            "role": user_role,
            "is_admin": is_admin,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
        }, current_app.config['SECRET_KEY'], algorithm='HS256')

        log.info("Token gerado com sucesso. user_id=%s | role=%s", user_id, user_role)

        return {
            "message": "Token gerado com sucesso!",
            "token": token,
            "user": {
                "id": user_id,
                "email": user_email,
                "name": username,
                "role": user_role,
                "is_admin": is_admin
            }
        } 
    
    except Exception as e:
        log.error("Erro ao autenticar usuário. email=%s | Erro: %s", email, e)
        return {"error": f"Erro ao tentar autenticar usuário. {e}"}    

def register_user_logic(email, password, name, role='athlete'):
    try:
        find_user = get_all_users_by_email(email)

        if find_user:
            log.warning("Tentativa de cadastro com e-mail já existente. email=%s", email)
            raise Exception("Usuário já está cadastrado no sistema")
        
        email_lower = email.lower()
        if "@nutricionista" in email_lower:
            role = "nutritionist"
        elif "@treinador" in email_lower:
            role = "trainer"
        elif "@medico" in email_lower:
            role = "physician"
        else:
            role = "athlete"

        hashed_password = generate_password_hash(password)
        password = hashed_password

        insert_new_user(email, password, name, role)
        log.info("Novo usuário criado com sucesso. email=%s | role=%s", email, role)

        return {"message": "Usuário criado com sucesso!"}

    except Exception as e:
        log.error("Erro ao registrar usuário. email=%s | Erro: %s", email, e)
        return {"error": f"Erro ao tentar autenticar usuário. {e}"}    

def list_all_users_logic():
    try:
        all_users = get_all_data_users()
        
        if not all_users:
            raise Exception("Nenhum usuário encontrado no sistema.")
        
        users = []
        for user in all_users:
            users.append({
                "id": user[0],
                "email": user[1],
                "name": user[2],
                "role": user[3],
                "is_active": user[4]
            })

        log.info("Usuários listados com sucesso. count=%s", len(users))

        return {
            "message": f"Usuários listados com sucesso!",
            "Count": len(users),
            "users": users
                }
    
    except Exception as e:
        log.error("Erro ao listar usuários. Erro: %s", e)
        return {"error": f"Erro ao tentar autenticar usuário. {e}"}

def update_user_data_logic(user_id, new_email=None, new_password=None, new_name=None):
    try:
        found_user = get_all_users_by_id(user_id)
        
        if not found_user:
            raise Exception(f"Usuário com id {user_id} não encontrado")
        
        if new_email:
            update_user_email(new_email, user_id)
            log.debug("E-mail atualizado. user_id=%s", user_id)
            
        if new_password:
            hashed_password = generate_password_hash(new_password)
            password = hashed_password
            update_user_password(password, user_id)
            log.debug("Senha atualizada. user_id=%s", user_id)

        if new_name:
            update_user_name(new_name, user_id)
            log.debug("Nome atualizado. user_id=%s", user_id)

        log.info("Usuário atualizado com sucesso. user_id=%s", user_id)

        return {"message": "Usuário atualizado com sucesso"}
    
    except Exception as e:
        log.error("Erro ao atualizar usuário. user_id=%s | Erro: %s", user_id, e)
        return {"error": f"Erro ao tentar autenticar usuário. {e}"}

def delete_user_logic(user_id):
    try:
        found_user = get_all_users_by_id(user_id)

        if not found_user:
            raise Exception (f"Usuário com id {user_id} não encontrado")
        
        update_desactive_user_account(user_id)
        log.info("Usuário desativado com sucesso. user_id=%s", user_id)

        return {"message": "Usuário desativado com sucesso!"}
    
    except Exception as e:
        log.error("Erro ao desativar usuário. user_id=%s | Erro: %s", user_id, e)
        return {"error": f"Erro ao tentar autenticar usuário. {e}"}