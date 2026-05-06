from backend.src.config.connection import create_connection
from backend.src.DAOS.user_DAO import *

import jwt
from flask import current_app
import datetime
from werkzeug.security import generate_password_hash, check_password_hash

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
            raise ValueError("Senha incorreta")
        
        token = jwt.encode({
            "User_id": user_id,
            "email": user_email,
            "name": username,
            "role": user_role,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
        }, current_app.config['SECRET_KEY'], algorithm='HS256')

        return {
            "message": "Token gerado com sucesso!",
            "token": token
        } 
    
    except Exception as e:
        return {"error": f"Erro ao tentar autenticar usuário. {e}"}    

def register_user_logic(email, password, name, role='athlete'):
    try:
        find_user = get_all_users_by_email(email)

        if find_user:
            raise Exception("Usuário já está cadastrado no sistema")
        
        hashed_password = generate_password_hash(password)
        password = hashed_password

        insert_new_user(email, password, name, role)

        return {"message": "Usuário criado com sucesso!"}

    except Exception as e:
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

        return {
            "message": f"Usuários listados com sucesso!",
            "Count": len(users),
            "users": users
                }
    
    except Exception as e:
        return {"error": f"Erro ao tentar autenticar usuário. {e}"}

def update_user_data_logic(user_id, new_email=None, new_password=None, new_name=None):
    try:
        found_user = get_all_users_by_id(user_id)
        
        if not found_user:
            raise Exception(f"Usuário com id {user_id} não encontrado")
        
        if new_email:
            update_user_email(new_email, user_id)
            
        if new_password:
            hashed_password = generate_password_hash(new_password)
            password = hashed_password
            update_user_password(password, user_id)

        if new_name:
            update_user_name(new_name, user_id)

        return {"message": "Usuário atualizado com sucesso"}
    
    except Exception as e:
        return {"error": f"Erro ao tentar autenticar usuário. {e}"}

def delete_user_logic(user_id):
    try:
        found_user = get_all_users_by_id(user_id)

        if not found_user:
            raise Exception (f"Usuário com id {user_id} não encontrado")
        
        update_desactive_user_account(user_id)

        return {"message": "Usuário desativado com sucesso!"}
    
    except Exception as e:
        return {"error": f"Erro ao tentar autenticar usuário. {e}"}
