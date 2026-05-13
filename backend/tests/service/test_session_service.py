import pytest
from datetime import datetime
from backend.src.services.session_service import (
    create_session_logic,
    calculate_session_metrics,
    session_mass_logic,
    session_end_logic,
    session_hydration_logic,
    save_session_result,
    get_session_data,
    session_environment_logic

)

# teste da funçao sobre a urina
def test_create_session_hydration(mocker):

    fixed_date = datetime(2026, 5, 9, 14, 0, 0)

    mock_get_by_user = mocker.patch("backend.src.services.session_service.get_athlete_profile_by_user_id")
    mock_get_by_id = mocker.patch("backend.src.services.session_service.get_athlete_profile_by_id")
    mock_create_session = mocker.patch("backend.src.services.session_service.create_training_session", return_value=100)
    mock_get_by_user.return_value = None
    mock_get_by_id.return_value = None
    mocker.patch("backend.src.services.session_service.create_athlete_profile", return_value=50)

    # teste cor da urina = 1 ( n sei pq ta retornando erro)
    resp = create_session_logic(1, "Corrida", "Alta", fixed_date, 1, True, True, 200, "Nota")
    assert "Excesso de água" in resp["hydration_alert"]

    # hidratação boa (2,3,4)
    resp = create_session_logic(2, "Corrida", "Alta", fixed_date, 2, True, True, 200, "Nota")
    assert "Boa hidratação" in resp["hydration_alert"]

    resp = create_session_logic(3, "Natação", "Média", fixed_date, 3, True, False, 200, "Nota")
    assert "Boa hidratação" in resp["hydration_alert"]

    resp = create_session_logic(4, "Futebol", "Alta", fixed_date, 4, True, False, 200, "Nota")
    assert "Boa hidratação" in resp["hydration_alert"] 
    
    # Cuidado (5)
    resp = create_session_logic(5, "Corrida", "Alta", fixed_date, 5, True, False, 200, "Nota")
    assert "reter água" in resp["hydration_alert"]

    # desidratação (6,7,8)
    resp = create_session_logic(6, "Corrida", "Alta", fixed_date, 6, True, True, 200, "Nota")
    assert "persistir mesmo após beber água" in resp["hydration_alert"]
                                    
    resp = create_session_logic(7, "Natação", "Alta", fixed_date, 7, True, True, 200, "Nota")
    assert "persistir mesmo após beber água" in resp["hydration_alert"]
                                    
    resp = create_session_logic(8, "Futebol", "Alta", fixed_date, 8, True, True, 200, "Nota")
    assert "persistir mesmo após beber água" in resp["hydration_alert"]

    # validacao dos valores
    resp = create_session_logic(9, "Corrida", "Alta", fixed_date, 10, True, True, 200, "Nota")
    assert "error" in resp
    assert "escala fornecida" in resp["error"]

    # volume negativo
    resp = create_session_logic(1, "Corrida", "Alta", fixed_date, 3, True, True, -50, "Nota")
    assert "error" in resp
    assert "não pode ser negativo" in resp["error"]

    # teste criação perfil 
    mock_get_by_user.return_value = None
    mocker.patch("backend.src.services.session_service.get_athlete_profile_by_id", return_value=None)
    mock_create_profile = mocker.patch("backend.src.services.session_service.create_athlete_profile", return_value=50)

    resp = create_session_logic(999, "Corrida", "Alta", fixed_date, 3, True, True, 200, "Nota")

    mock_create_profile.assert_called_once()
    assert resp["message"] == "Sessão criada com sucesso!"

# teste validacao do peso
def test_session_mass_logic(mocker):

    mock_select = mocker.patch("backend.src.services.session_service.select_all_data")
    mock_update = mocker.patch("backend.src.services.session_service.update_mass_value")
    
    # peso invalido
    response = session_mass_logic(0, 70, 1) 
    assert "error" in response
    assert "Peso inicial deve ser maior que zero" in response["error"]

    # banco nao puxa sessao
    mock_select.return_value = None
    response = session_mass_logic(80, 75, 999)
    assert "Sessão de treino não encontrada" in response["error"]

    # sessao existe
    mock_select.return_value = (1, "dados_da_sessao")

    # se ta atualizando certo
    response = session_mass_logic(80, 78, 1)
    
    assert "message" in response
    assert response["diff_kg"] == -2.5
    mock_select.assert_called_with(1)
    mock_update.assert_called_once_with(80, 78, 1)

# teste de metricas
def test_calculate_session_metrics_logic(mocker):

    # risco baixo < 2%
    data_low = {
        'id': 1,
        'pre_weight_kg': 80.0,
        'post_weight_kg': 78.5, 
        'total_intake_ml': 500,
        'urine_volume_ml': 200,
        'duration_hours': 1.0
    }
    metrics = calculate_session_metrics(data_low)
    
    assert metrics['adjusted_weight_loss_kg'] == 1.8
    assert metrics['sweat_rate_lph'] == 1.8
    assert metrics['weight_loss_pct'] == 1.88
    assert metrics['dehydration_risk'] == "low"
    assert metrics['alert_dehydration'] is False
    assert "Hidratação adequada" in metrics['notes']

    # risco moderado < 3%

    data_mod = data_low.copy()
    data_mod['post_weight_kg'] = 78.0
    metrics_mod = calculate_session_metrics(data_mod)
    
    assert metrics_mod['dehydration_risk'] == "moderate"
    assert metrics_mod['alert_dehydration'] is True
    assert "Risco de desidratação detectado!" in metrics_mod['notes']

    # risco alto < 4
    data_high = data_low.copy()
    data_high['post_weight_kg'] = 77.2
    metrics_high = calculate_session_metrics(data_high)
    
    assert metrics_high['dehydration_risk'] == "high"
    assert metrics_high['alert_dehydration'] is True

    #else : critical
    data_crit = data_low.copy()
    data_crit['post_weight_kg'] = 76.0
    metrics_crit = calculate_session_metrics(data_crit)
    
    assert metrics_crit['dehydration_risk'] == "critical"
    assert metrics_crit['alert_dehydration'] is True

    # verificacao de quanto o atleta deve beber por hora
    assert metrics['target_intake_min_mlh'] == 400
    assert metrics['target_intake_max_mlh'] == 800
    
    # verificação de metadados
    assert isinstance(metrics['calculated_at'], datetime)

# salvamento de sessão 
def test_save_session_result(mocker):
    session_id = 1

    mocker.patch("backend.src.services.session_service.get_id_by_session_id", return_value=None)
    spy = mocker.patch("backend.src.services.session_service.insert_session_result")

    metrics = {
        "weight_loss_pct": 2
        }
    
    result = save_session_result(session_id, metrics)

    assert result is None

    spy.assert_called_once_with(metrics, session_id)

# teste se salva alterações
def test_save_session_result_update(mocker):
    session_id = 1

    mocker.patch("backend.src.services.session_service.get_id_by_session_id",return_value=(1,))
    spy = mocker.patch("backend.src.services.session_service.update_session_result")

    metrics = {
        "weight_loss_pct": 2
    }

    result = save_session_result(session_id, metrics)

    assert result is None

    spy.assert_called_once_with(metrics, session_id)


# testa possiveis erros em salvar a sessao
def test_save_session_result_error(mocker):
    mocker.patch("backend.src.services.session_service.get_id_by_session_id", side_effect=Exception("Falha na conexão"))

    metrics = {
        "weight_loss_pct": 2
        }
    
    result = save_session_result(1, metrics)

    assert "error" in result
    assert "Falha na conexão" in result["error"]


# test session data sucesso
def test_get_session_data_success(mocker):

    start = datetime(2026, 5, 9, 14, 0, 0)
    end = datetime(2026, 5, 9, 15, 30, 0)

    mocker.patch("backend.src.services.session_service.select_session_data", return_value=( 1, 80.0, 78.5, start, end, 30, 60 ))

    resp = get_session_data(1)

    assert resp["id"] == 1
    assert resp["duration_hours"] == 1.5
    assert resp["pre_weight_kg"] == 80.0
    assert "error" not in resp


# teste de sessao não encontrada    
def test_get_session_data_not_found(mocker):

    mocker.patch(
        "backend.src.services.session_service.select_session_data",
        return_value=None
    )

    session_id = 999

    resp = get_session_data(session_id)

    assert "error" in resp
    assert f"Sessão com id {session_id} não encontrada" in resp["error"]

# teste temperatura/clima sucesso
def test_session_environment_logic_success(mocker):

    mocker.patch("backend.src.services.session_service.select_all_data",return_value=(1,))
    spy = mocker.patch("backend.src.services.session_service.update_environment_data")
    
    temperatura, umidade, id = 30, 60, 1
    resp = session_environment_logic(30,60,1)

    assert "message" in resp
    assert resp["temperature_c"] == temperatura
    assert resp["humidity"] == umidade
    assert resp["session_id"] == id

    spy.assert_called_once_with(temperatura, umidade, id)

# teste temperatura/clima inexistente
def test_session_environment_logic_not_found(mocker):

    mocker.patch("backend.src.services.session_service.select_all_data", return_value=None)

    resp = session_environment_logic(30,60,1)

    assert "error" in resp
    assert "Sessão de treino não encontrada" in resp["error"]

# teste sessao de hidratacao sucesso
def test_session_hydration_success(mocker):

    mocker.patch("backend.src.services.session_service.get_hydration_id_by_session_id",return_value=(1,))
    spy = mocker.patch("backend.src.services.session_service.insert_hydration_data")

    session_id = 1
    volume = 500
    fluid = "water"
    resp = session_hydration_logic(session_id, volume, fluid)

    assert "message" in resp
    assert resp["volume_ml"] == volume
    assert resp["fluid_type"] == fluid
    assert isinstance(resp["logged_at"], datetime)
    
    spy.assert_called_once_with(session_id, volume, fluid, mocker.ANY)

# teste de volume negativo
def test_session_hydration_negative_volume(mocker):

    mocker.patch("backend.src.services.session_service.get_hydration_id_by_session_id",return_value=(1,))
    spy = mocker.patch("backend.src.services.session_service.insert_hydration_data")

    resp = session_hydration_logic(1, -500)

    assert "error" in resp
    assert "Volume deve ser maior que zero" in resp["error"]

    spy.assert_not_called()


# teste volume n encontrado
def test_session_hydration_session_not_found(mocker):
    mocker.patch("backend.src.services.session_service.get_hydration_id_by_session_id",return_value=None)

    resp = session_hydration_logic(999, 500)

    assert "error" in resp
    assert "Sessão não encontrada" in resp["error"]

# teste logica horarios
def test_session_end_logic_success(mocker):
    start_time = datetime(2026, 5, 9, 14, 0, 0)
    end_time = datetime(2026, 5, 9, 15, 30, 0)
    session_id = 1
    
    mocker.patch("backend.src.services.session_service.get_specific_data_end", return_value=(session_id, start_time))
    
    spy = mocker.patch("backend.src.services.session_service.update_data_end")
    
    resp = session_end_logic(session_id, end_time)
    
    assert resp["duration_hours"] == 1.5
    assert "sucesso" in resp["message"]
    assert resp["session_end"] == end_time

    spy.assert_called_once_with(session_id, end_time)

# teste logica horarios n encontrado
def test_session_end_logic_not_found(mocker):
    mocker.patch("backend.src.services.session_service.get_specific_data_end", return_value=None)
    
    resp = session_end_logic(999, datetime.now())
    
    assert "error" in resp
    assert "Sessão não encontrada" in resp["error"]
