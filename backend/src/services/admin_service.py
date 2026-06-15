import logging
from backend.src.DAOS.admin_DAO import *

log = logging.getLogger("meuapp")   

def get_admin_profile_data_logic(user_id):
    try:
        found_admin = get_admin_profile_by_user_id(user_id)
        
        if not found_admin:
            raise Exception(f"Admnistrador com id {user_id} não encontrado")

        admin_data = {
            "id": found_admin[0],
            "admin_id": found_admin[1],
            "name": found_admin[2],
            "birth_date": found_admin[3].isoformat() if found_admin[3] else None,
            "gender": found_admin[4],
            "role_title": found_admin[5],
            "team_id": found_admin[6]
        }
        
        log.info("Perfil do administrador %s recuperado com sucesso.", user_id)

        return{
            "message": f"Dados do administrador listados com sucesso!",
            "data": admin_data
        }

    except Exception as e:
        log.error("Erro ao listar administradores. Erro: %s", e)
        return {"error": f"Erro ao tentar autenticar administrador. {e}"}



def save_admin_data_logic(user_id, full_name, birth_date, gender, role_title, team_id):
    try:
        formatted_birth_date = birth_date if birth_date else None
        formatted_team_id = team_id if team_id and team_id != "" else None
    
        update_admin_profile(user_id=user_id, full_name=full_name, 
                birth_date=formatted_birth_date, gender=gender, 
                role_title=role_title, team_id=formatted_team_id)
        
        log.info("Perfil do administrador atualizado com sucesso. user_id=%s", user_id)
        return {"message": "Perfil do administrador atualizado com sucesso!"}

    except Exception as e:
        log.error("Erro ao salvar perfil do administrador %s. Erro: %s", user_id, e)
        return {"error": f"Erro ao tentar salvar os dados. {e}"}
    
