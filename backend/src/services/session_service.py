from backend.src.DAOS.session_DAO import *
from datetime import datetime

def create_session_logic(athlete_id, modality, intensity, session_start, urine_color_pre, bladder_emptied, clothing_soaked, urine_volume_ml, notes):
    try:
        if  urine_color_pre < 1 or urine_color_pre > 8:
            raise ValueError("Insira um valor dentro da escala fornecida")
        # 1 --> excesso de agua
        if urine_color_pre == 1:
            message = "Excesso de água. Você pode estar bebendo água demais, o que pode diluir sais minerais essenciais no sangue. Reduza um pouco o ritmo."
        # 2, 3 e 4 --> boa hidratação
        if urine_color_pre == 2 or urine_color_pre == 3 or urine_color_pre == 4:
            message = "Boa hidratação. Seu corpo tem a quantidade certa de fluidos para funcionar bem. Continue assim!"
        # 5 --> cuidado
        if urine_color_pre == 5:
            message = "Seu corpo está começando a reter água. É um sinal amarelo (literalmente) para você beber um copo de água agora."
        # 6 e 7 --> desidratação
        if urine_color_pre == 6 or urine_color_pre == 7 or urine_color_pre == 8:
            message = "O corpo pode estar desidratado. Se a cor persistir mesmo após beber água, pode indicar problemas nos rins ou fígado."
        
        if urine_volume_ml < 0:
            raise ValueError("Volume da urina não pode ser negativo.")
        
        profile = get_athlete_profile_by_user_id(athlete_id)

        if profile:
            athlete_profile_id = profile[0]
        else:
            profile_exists = get_athlete_profile_by_id(athlete_id)

            if profile_exists:
                session_id = update_training_session(athlete_id, modality, intensity, session_start, urine_color_pre, bladder_emptied, clothing_soaked, urine_volume_ml, notes) 
            else:
                athlete_code = f"ATH_{str(athlete_id)[:8].upper()}"
                athlete_profile_id = create_athlete_profile(athlete_id, athlete_code)
                session_id = create_training_session(athlete_profile_id, modality, intensity, session_start, urine_color_pre, bladder_emptied, clothing_soaked, urine_volume_ml, notes)

        return {
            "message": "Sessão criada com sucesso!",
            "athlete_id": session_id,
            "hydration_alert": message
        }
    
    except Exception as e:
        return {"error": f"Erro ao tentar criar sessão. {e}"}
        

def session_mass_logic(pre_weight_kg, post_weight_kg, session_id):
    try:
        session = select_all_data(session_id)
        
        if pre_weight_kg <= 0:
            raise ValueError("Peso inicial deve ser maior que zero.")

        if not session:
            raise ValueError("Sessão de treino não encontrada para este usuário")
        
        weight_loss_pct = ((post_weight_kg - pre_weight_kg)/pre_weight_kg) * 100

        update_mass_value(pre_weight_kg, post_weight_kg, session_id)

        return {
            "message": "Percentual de variação de massa adicionado com sucesso no banco de dados!",
            "diff_kg": round(weight_loss_pct, 2)    
                }
    
    except Exception as e:
        return {"error": f"Erro ao tentar criar sessão. {e}"}

def calculate_session_metrics(session_data):
    pre_weight = float(session_data['pre_weight_kg'])
    pos_weight = float(session_data['post_weight_kg'])
    total_intake_ml = float(session_data.get('total_intake_ml', 0))    
    urine_volume_ml = float(session_data.get('urine_volume_ml', 0))
    duration_hours = float(session_data.get('duration_hours', 1))

    # Perda de massa ajustada
    mass_loss_kg = pre_weight - pos_weight
    adjusted_weight_loss_kg = mass_loss_kg + (total_intake_ml / 1000) - (urine_volume_ml / 1000)
    
    # Percentual de variação
    weight_loss_pct = (mass_loss_kg / pre_weight) * 100 if pre_weight > 0 else 0
    
    # Taxa de sudorese (L/h)
    sweat_rate_lph = adjusted_weight_loss_kg / duration_hours if duration_hours > 0 else 0
    
    # Balanço hídrico (mL)
    fluid_balance_ml = total_intake_ml - (adjusted_weight_loss_kg * 1000) 

    if weight_loss_pct < 1:
        risk_level = "none"
    elif weight_loss_pct < 2:
        risk_level = "low"
    elif weight_loss_pct < 3:
        risk_level = "moderate"
    elif weight_loss_pct < 4:
        risk_level = "high"
    else:
        risk_level = "critical"

    min_intake = pre_weight * 5     # 5ml/kg/hr 
    max_intake = pre_weight * 10    # 10ml/kg/hr

    interval_minutes = 15 if sweat_rate_lph < 1 else 10 if sweat_rate_lph < 2 else 20

    alert_dehydration = weight_loss_pct > 2
    alert_overhydration = fluid_balance_ml > 1000 # nesse caso, a retenção se torna excessiva

    if alert_dehydration:
        notes = f"Risco de desidratação detectado! Perda de {round(weight_loss_pct, 2)} do peso corporal"
    elif alert_overhydration:
        notes = f"Risco de hiperhidratação detectado! Balanço hidrico positivo de {round(fluid_balance_ml, 2)}ml."
    else:
        notes = "Hidratação adequada."

    return {
        "session_id": session_data['id'],
        "total_intake_ml": total_intake_ml,
        "adjusted_weight_loss_kg": round(adjusted_weight_loss_kg, 2),
        "weight_loss_pct": round(weight_loss_pct, 2),
        "sweat_rate_lph": round(sweat_rate_lph, 2),
        "fluid_balance_ml": round(fluid_balance_ml, 2),
        
        "dehydration_risk": risk_level,
        "target_intake_min_mlh": min_intake,
        "target_intake_max_mlh": max_intake,
        "interval_minutes": interval_minutes,
        "alert_dehydration": alert_dehydration,
        "alert_overhydration": alert_overhydration,
        "notes": notes,
        "calculated_at": datetime.now()
    }

def save_session_result(session_id, metrics):
    try:
        existing = get_id_by_session_id(session_id)

        if existing:
            update_session_result(metrics, session_id)
        else:
            insert_session_result(metrics, session_id)

    except Exception as e:
        return {"error": f"Erro ao tentar criar sessão. {e}"}

def get_session_data(session_id): 
    try:
        session = select_session_data(session_id)
        
        if not session:
            raise ValueError(f"Impossível buscar dados do usuário no momento. Sessão com id {session_id} não encontrada.")
        
        session_data = {
            "id": session[0],
            "pre_weight_kg": session[1],
            "post_weight_kg": session[2],
            "session_start": session[3],
            "session_end": session[4],
            "temperature_c": session[5],
            "humidity_pct": session[6],
        }

        if session[4] and session[3]:
            duration_session = (session[4] - session[3]).total_seconds() / 3600
            session_data["duration_hours"] = round(duration_session, 2)
        
        return session_data
    
    except Exception as e:
        return {"error": f"Erro ao tentar criar sessão. {e}"}
    

def session_environment_logic(temperature_c, humidity_pct, session_id):
    try:
        session = select_all_data(session_id)
        if not session:
            raise ValueError("Sessão de treino não encontrada")
        
        update_environment_data(temperature_c, humidity_pct, session_id)

        return{
            "message": "temperatura e umidade adicionados com sucesso ao banco de dados!",
            "temperature_c": temperature_c,
            "humidity": humidity_pct,
            "session_id": session_id
        }

    except Exception as e:
        return {"error": f"Erro ao tentar criar sessão. {e}"}

def session_hydration_logic(session_id, volume_ml, fluid_type='water', logged_at=None):   
    try:
        session = get_hydration_id_by_session_id(session_id)
        if not session:
            raise ValueError("Sessão não encontrada")
        
        if not logged_at:
            logged_at = datetime.now()

        if volume_ml <= 0:
            raise ValueError("Volume deve ser maior que zero.") 

        insert_hydration_data(session_id, volume_ml, fluid_type, logged_at)
        
        return {
            "message": "Ingestão registrada com sucesso",
            "session_id": session_id,
            "volume_ml": volume_ml,
            "fluid_type": fluid_type,
            "logged_at": logged_at
        }

    except Exception as e:
       return {"error": f"Erro ao tentar criar sessão. {e}"}

def session_end_logic(session_id, session_end):    
    try:
        result = get_specific_data_end(session_id)
 
        if not result:
            raise ValueError("Sessão não encontrada")
        
        session_start = result[1]

        if session_start.tzinfo is not None:
            session_start = session_start.replace(tzinfo=None)
        if session_end.tzinfo is not None:
            session_end = session_end.replace(tzinfo=None)

        duration_hours = None
        if session_start and session_end:
            duration = (session_end - session_start).total_seconds() / 3600
            duration_hours = round(duration, 2)

        update_data_end(session_id, session_end)

        return {
            "message": "Sessão finalizada com sucesso!",
            "session_id": session_id,
            "session_end": session_end,             
            "duration_hours": duration_hours
        }
    
    except Exception as e:
        return {"error": f"Erro ao tentar criar sessão. {e}"}

