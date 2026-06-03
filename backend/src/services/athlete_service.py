import logging
from backend.src.DAOS.athlete_DAO import get_full_athlete_profile, upsert_athlete_profile

log = logging.getLogger("meuapp")

MODALIDADES = [
    "Futebol", "Futsal", "Basquete", "Vôlei", "Natação",
    "Atletismo", "Ciclismo", "Tênis", "Handebol", "Rugby",
    "Corrida", "Musculação", "Jiu-Jitsu", "Judô", "Outro",
]


def get_athlete_profile_data(user_id):
    row = get_full_athlete_profile(user_id)
    if not row:
        return {"nome": "", "dataNascimento": "", "genero": "", "peso": "", "altura": "", "modalidadeId": "", "equipeId": ""}

    nome, birth_date, gender, body_weight_kg, height_cm, sport_modality = row
    return {
        "nome": nome or "",
        "dataNascimento": birth_date.isoformat() if birth_date else "",
        "genero": gender or "",
        "peso": str(body_weight_kg) if body_weight_kg is not None else "",
        "altura": str(height_cm) if height_cm is not None else "",
        "modalidadeId": sport_modality or "",
        "equipeId": "",
    }


def save_athlete_profile_data(user_id, nome, data_nascimento, genero, modalidade_id, peso, altura):
    birth_date = data_nascimento if data_nascimento else None
    body_weight_kg = float(peso) if peso else None
    height_cm = float(altura) if altura else None
    upsert_athlete_profile(user_id, nome, birth_date, genero, modalidade_id, body_weight_kg, height_cm)
    log.info("Perfil do atleta atualizado. user_id=%s", user_id)


def get_modalidades_list():
    return [{"id": m, "nome": m} for m in MODALIDADES]
