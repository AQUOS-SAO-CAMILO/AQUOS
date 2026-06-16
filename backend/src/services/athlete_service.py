import logging
from backend.src.DAOS.athlete_DAO import get_full_athlete_profile, upsert_athlete_profile, get_atletas_risco_count

log = logging.getLogger("meuapp")

MODALIDADES = [
    "Futebol", "Futsal", "Basquete", "Vôlei", "Natação",
    "Atletismo", "Ciclismo", "Tênis", "Handebol", "Rugby",
    "Corrida", "Musculação", "Jiu-Jitsu", "Judô", "Outro",
]


def get_athlete_profile_data(user_id):
    try:
        found_athlete = get_full_athlete_profile(user_id)

        athlete_data = {
            "name": found_athlete[0],
            "birth_date": found_athlete[1].isoformat() if found_athlete[1] else None,
            "gender": found_athlete[2],
            "body_weight_kg": found_athlete[3],
            "height_cm": found_athlete[4],
            "sport_modality": found_athlete[5]
        }

        log.info("Perfil do atleta %s recuperado com sucesso.", user_id)

        return{
            "message": f"Dados do atleta listados com sucesso!",
            "data": athlete_data
        }

    except Exception as e:
        log.error("Erro ao listar atletaes. Erro: %s", e)
        return {"error": f"Erro ao tentar autenticar atleta. {e}"}

def save_athlete_profile_data(user_id, name, birth_date, gender, sport_modality, body_weight_kg, height_cm):
    try:
        formatted_birth_date = birth_date if birth_date else None
        formatted_body_weight_kg = float(body_weight_kg) if body_weight_kg else None
        formatted_height_cm = float(height_cm) if height_cm else None
        
        upsert_athlete_profile(user_id, name, formatted_birth_date, gender, sport_modality, formatted_body_weight_kg, formatted_height_cm)
        log.info("Perfil do atleta atualizado. user_id=%s", user_id)

    except Exception as e:
        log.error("Erro ao salvar perfil do administrador %s. Erro: %s", user_id, e)
        return {"error": f"Erro ao tentar salvar os dados. {e}"}

def get_modalidades_list():
    return [{"id": m, "name": m} for m in MODALIDADES]

def get_atletas_em_risco():
    return get_atletas_risco_count()