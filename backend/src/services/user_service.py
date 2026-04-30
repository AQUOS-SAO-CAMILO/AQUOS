import jwt
from backend.src.config.connection import create_connection
from flask import current_app
import datetime
from werkzeug.security import generate_password_hash, check_password_hash

def authenticate_user_logic(email, password):
    connection = create_connection()
    if not connection:
        # return jsonify({"error": "Não foi possível conectar com o banco"}), 500
        raise Exception("Não foi possível conectar com o banco")

    try:
        # Verificar se o user existe no banco de dados
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        found_user_result = cursor.fetchone()

        if not found_user_result:
            # return jsonify({"error": "Usuário não encontrado"}), 404
            raise ValueError("Usuário não encontrado")
        
        user_id = found_user_result[0]
        user_email = found_user_result[1]
        password_hash = found_user_result[2]
        username = found_user_result[3]
        user_role = found_user_result[4]

        # Verificar se a password está correta 
        if not check_password_hash(password_hash, password):
            # return jsonify({"error": "Senha incorreta"}), 401
            raise ValueError("Senha incorreta")
        
        token = jwt.encode({
            "User_id": user_id,
            "email": user_email,
            "name": username,
            "role": user_role,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
        }, current_app.config['SECRET_KEY'], algorithm='HS256')

        return token 
    
    finally:
        connection.close()   

def register_user_logic(email, password, name, role='athlete'):
    connection = create_connection()
    if not connection:
        # return jsonify({"error": "Não foi possível conectar com o banco"}), 500
        raise Exception("Não foi possível conectar com o banco")
    
    try:
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        if cursor.fetchone():
            raise Exception("Usuário já está cadastrado no sistema")
        
        hashed_password = generate_password_hash(password)

        cursor.execute("INSERT INTO users (email, password_hash, name, role) VALUES (%s, %s, %s, %s)", (email, hashed_password, name, role))
        connection.commit()

        return {"message": "Usuário criado com sucesso!"}

    finally:    
        connection.close()

def list_all_users_logic():
    connection = create_connection()
    if not connection:
        # return jsonify({"error": "Não foi possível conectar com o banco"}), 500
        raise Exception("Não foi possível conectar com o banco")
    
    try:
        cursor = connection.cursor()
        cursor.execute("SELECT id, email, name, role, is_active FROM users")
        all_users = cursor.fetchall()

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
    
    finally:
        connection.close()

def update_user_data_logic(user_id, new_email=None, new_password=None, new_name=None):
    connection = create_connection()
    if not connection:
        raise Exception("Não foi possível conectar com o banco")
    
    try:
        cursor = connection.cursor()

        cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
        found_user = cursor.fetchone()

        if not found_user:
            raise Exception(f"Usuário com id {user_id} não encontrado")
        
        if new_email:
            cursor.execute("UPDATE users SET email = %s WHERE id = %s", (new_email, user_id))
            
        if new_password:
            hashed_password = generate_password_hash(new_password)
            cursor.execute("UPDATE users SET password_hash = %s WHERE id = %s", (hashed_password, user_id))

        if new_name:
            cursor.execute("UPDATE users SET name = %s where id = %s", (new_name, user_id))

        connection.commit()
        return {"message": "Usuário atualizado com sucesso"}
    
    finally:
        connection.close()

def delete_user_logic(user_id):
    connection = create_connection()
    if not connection:
        raise Exception("Não foi possível conectar com o banco")
    
    try:
        cursor = connection.cursor()

        cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
        found_user = cursor.fetchone()

        if not found_user:
            raise Exception (f"Usuário com id {user_id} não encontrado")
        
        # Ele vai só desativar, não deletar completamente o usuário
        cursor.execute("UPDATE users SET is_active = FALSE WHERE id = %s", (user_id,))
        connection.commit()

        return {"message": "Usuário desativado com sucesso!"}
    
    finally:
        connection.close()
