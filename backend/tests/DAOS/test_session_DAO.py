import pytest
from backend.src.DAOS.session_DAO import (
    create_athlete_profile,
    create_training_session,
    get_athlete_profile_by_id,
    get_athlete_profile_by_user_id,
    get_id_by_session_id,
    get_hydration_id_by_session_id,
    get_specific_data_end,
    update_mass_value,
    update_session_result,
    update_environment_data,
    update_data_end,
    update_training_session,
    insert_session_result,
    insert_hydration_data,
    select_all_data,
    select_session_data
)


# fixture que simula a conexão e cursor do banco na DAO
@pytest.fixture
def mock_db(mocker):
    mock_conn = mocker.patch("backend.src.DAOS.session_DAO.create_connection")
    connection_instance = mock_conn.return_value
    cursor_instance = connection_instance.cursor.return_value
    return connection_instance, cursor_instance

# testes da funcao get_athlete_profile_by_id
def test_get_athlete_profile_by_id(mock_db):
    conn, cursor = mock_db
    cursor.fetchone.return_value = ("profile",)

    result = get_athlete_profile_by_id("id_test")

    assert result == ("profile",)

    cursor.execute.assert_called_with(
        "SELECT id FROM athlete_profiles WHERE id = %s", ("id_test",)
    )

    conn.commit.assert_not_called()
    conn.close.assert_called_once()

# testes da funcao get_athlete_profile_by_user_id
def test_get_athlete_profile_by_user_id(mock_db):
    conn, cursor = mock_db
    cursor.fetchone.return_value = ("profile",)

    result = get_athlete_profile_by_user_id("user_123")

    assert result == ("profile",)

    cursor.execute.assert_called_with(
        "SELECT id FROM athlete_profiles WHERE user_id = %s", ("user_123",)
    )

    conn.commit.assert_not_called()
    conn.close.assert_called_once()

# testes da funcao create_athlete_profile
def test_create_athlete_profile(mock_db):
    conn, cursor = mock_db
    cursor.fetchone.return_value = ("new_uuid",)

    result = create_athlete_profile("user_1", "CODE123")

    assert result == "new_uuid"

    conn.commit.assert_called_once()
    conn.close.assert_called_once()

# testes da funcao update_training_session
def test_update_training_session(mock_db):
    conn, cursor = mock_db

    result = update_training_session(10, "Bike", "Med", "09:00", 1, True, True, 0, "notes")

    assert result["Update"] is True
    assert result["session_id"] == 10

    conn.commit.assert_called_once()
    conn.close.assert_called_once()

# testes da funcao create_training_session
def test_create_training_session(mock_db):
    conn, cursor = mock_db
    cursor.fetchone.return_value = (500,)

    result = create_training_session("prof_1", "Swim", "Low", "10:00", 2, True, False, 100, "")

    assert result == 500

    conn.commit.assert_called_once()
    conn.close.assert_called_once()

# testes da funcao select_all_data
def test_select_all_data(mock_db):
    conn, cursor = mock_db
    cursor.fetchone.return_value = (1, "Running", "High")

    result = select_all_data(10)

    assert result == (1, "Running", "High")

    cursor.execute.assert_called_with(
        "SELECT * FROM training_sessions WHERE id = %s", (10,)
    )

    conn.commit.assert_not_called()
    conn.close.assert_called_once()

# testes da funcao get_id_by_session_id
def test_get_id_by_session_id(mock_db):
    conn, cursor = mock_db
    cursor.fetchone.return_value = ("result_99",)

    result = get_id_by_session_id(10)

    assert result == ("result_99",)

    cursor.execute.assert_called_with(
        "SELECT id FROM session_results WHERE session_id = %s", (10,)
    )

    conn.commit.assert_not_called()
    conn.close.assert_called_once()

# testes da funcao select_session_data
def test_select_session_data(mock_db):
    conn, cursor = mock_db
    cursor.fetchone.return_value = ("id", 70.0, 69.0, "start", "end", 22, 50)

    result = select_session_data(10)

    assert result[1] == 70.0

    conn.commit.assert_not_called()
    conn.close.assert_called_once()

# testes da funcao get_hydration_id_by_session_id
def test_get_hydration_id_by_session_id(mock_db):
    conn, cursor = mock_db
    cursor.fetchone.return_value = (10,)

    result = get_hydration_id_by_session_id(10)

    assert result == (10,)

    cursor.execute.assert_called_with(
        "SELECT id FROM training_sessions WHERE id = %s", (10,)
    )

    conn.commit.assert_not_called()
    conn.close.assert_called_once()

# testes da funcao get_specific_data_end
def test_get_specific_data_end(mock_db):
    conn, cursor = mock_db
    cursor.fetchone.return_value = (10, "2026-05-10")

    result = get_specific_data_end(10)

    assert result == (10, "2026-05-10")

    cursor.execute.assert_called_with(
        "SELECT id, session_start FROM training_sessions WHERE id = %s", (10,)
    )

    conn.commit.assert_not_called()
    conn.close.assert_called_once()




#fixture que simula um exemplo de dados metricos
@pytest.fixture
def example_metrics():
    return {
        'total_intake_ml': 100,
        'adjusted_weight_loss_kg': 0.5,
        'weight_loss_pct': 0.1,
        'sweat_rate_lph': 0.2,
        'fluid_balance_ml': -50,
        'dehydration_risk': 'Low',
        'target_intake_min_mlh': 50,
        'target_intake_max_mlh': 100,
        'interval_minutes': 10,
        'alert_dehydration': False,
        'alert_overhydration': False,
        'notes': '',
        'calculated_at': 'now',
    }

# testes da funcao insert_session_result
def test_insert_session_result(mock_db, example_metrics):
    conn, cursor = mock_db

    result = insert_session_result(example_metrics, 10)

    assert result["Insert"] is True
    assert result["session_id"] == 10
    conn.commit.assert_called_once()
    conn.close.assert_called_once()

# testes da funcao insert_hydration_data
def test_insert_hydration_data(mock_db):
    conn, cursor = mock_db

    result = insert_hydration_data(10, 250, "water")

    assert result["Insert"] is True
    assert result["session_id"] == 10

    cursor.execute.assert_called_with(
        "INSERT INTO fluid_intake_logs (session_id, volume_ml, fluid_type, logged_at) \n                      VALUES (%s, %s, %s, %s)",
        (10, 250, "water", None),
    )

    conn.commit.assert_called_once()
    conn.close.assert_called_once()

# testes da funcao update_mass_value
def test_update_mass_value(mock_db):
    conn, cursor = mock_db

    result = update_mass_value(75.5, 74.0, 10)

    assert result["Update"] is True
    assert result["session_id"] == 10

 # Larissa: descobri q se tira o espaçamento não funciona
    cursor.execute.assert_called_with(
    "UPDATE training_sessions     \n                      SET pre_weight_kg = %s, post_weight_kg = %s \n                      WHERE id = %s",
    (75.5, 74.0, 10),
)

    conn.commit.assert_called_once()
    conn.close.assert_called_once()

# testes da funcao update_session_result
def test_update_session_result(mock_db, example_metrics):
    conn, cursor = mock_db

    result = update_session_result(example_metrics, 10)

    assert result["Update"] is True
    assert result["session_id"] == 10

    conn.commit.assert_called_once()
    conn.close.assert_called_once()

# testes da funcao update_environment_data
def test_update_environment_data(mock_db):
    conn, cursor = mock_db

    result = update_environment_data(30, 80, 10)

    assert result["Update"] is True
    assert result["session_id"] == 10

 # Larissa: descobri q se tira o espaçamento não funciona
    cursor.execute.assert_called_with(
    "UPDATE training_sessions \n                       SET temperature_c = %s, humidity_pct = %s \n                       WHERE id = %s",
    (30, 80, 10),
)

    conn.commit.assert_called_once()
    conn.close.assert_called_once()

# testes da funcao update_data_end
def test_update_data_end(mock_db):
    conn, cursor = mock_db

    result = update_data_end(10, "2026-05-10 12:00")

    assert result["Update"] is True
    assert result["session_id"] == 10
    
 # Larissa: descobri q se tira o espaçamento não funciona
    cursor.execute.assert_called_with(
    "UPDATE training_sessions \n                       SET session_end = %s \n                       WHERE id = %s",
    ("2026-05-10 12:00", 10),
)

    conn.commit.assert_called_once()
    conn.close.assert_called_once()