import pytest
from backend.src.DAOS.user_DAO import (
    get_all_users_by_email,
    get_all_data_users,
    get_all_users_by_id,
    update_user_email,
    update_user_password,
    update_user_name,
    update_desactive_user_account,
    insert_new_user,
)

# fixture que simula a conexão e cursor do banco na DAO
@pytest.fixture
def mock_db_users(mocker):
    mock_conn_func = mocker.patch("backend.src.DAOS.user_DAO.create_connection")
    mock_conn_inst = mock_conn_func.return_value
    mock_cursor = mock_conn_inst.cursor.return_value
    return mock_conn_inst, mock_cursor


# teste da funcao get_all_users_by_email
def test_get_all_users_by_email(mock_db_users):
    conn, cursor = mock_db_users

    cursor.fetchone.return_value = (1, "lulu@email.com", "hash", "lulu", "admin", True)

    result = get_all_users_by_email("lulu@email.com")

    assert result[1] == "lulu@email.com"

    cursor.execute.assert_called_with(
        "SELECT * FROM users WHERE email = %s", ("lulu@email.com",))
    
    conn.commit.assert_not_called()
    conn.close.assert_called_once()

# teste da funcao insert_new_user
def test_insert_new_user(mock_db_users):
    conn, cursor = mock_db_users

    result = insert_new_user("novo@email.com", "hash", "Novo", "athlete")

    assert result["Insert"] is True
    assert result["email"] == "novo@email.com"

def test_insert_new_user_query(mock_db_users):
    conn, cursor = mock_db_users

    insert_new_user("novo@email.com", "hash", "Novo", "athlete")

    cursor.execute.assert_called_with(
        """INSERT INTO users (email, password_hash, name, role) \n                   VALUES (%s, %s, %s, %s)""",
        ("novo@email.com", "hash", "Novo", "athlete"),
    )

    conn.commit.assert_called_once()
    conn.close.assert_called_once()

# teste da funcao get_all_data_users
def test_get_all_data_users(mock_db_users):
    conn, cursor = mock_db_users

    cursor.fetchall.return_value = [
        (1, "a@a.com", "A", "user", True),
        (2, "b@b.com", "B", "user", True),
    ]

    result = get_all_data_users()

    assert len(result) == 2
    assert result[0][2] == "A"

    cursor.execute.assert_called_with(
        "SELECT id, email, name, role, is_active FROM users"
    )

    conn.commit.assert_not_called()
    conn.close.assert_called_once()

# testes da funcao get_all_users_by_id
def test_get_all_users_by_id(mock_db_users):
    conn, cursor = mock_db_users

    cursor.fetchone.return_value = (10, "id@email.com", "hash", "User ID", "athlete", True)

    result = get_all_users_by_id(10)

    assert result[0] == 10

    cursor.execute.assert_called_with(
        "SELECT * FROM users WHERE id = %s", (10,)
    )

    conn.commit.assert_not_called()
    conn.close.assert_called_once()

# teste da funcao update_user_email 
def test_update_user_email(mock_db_users):
    conn, cursor = mock_db_users

    result = update_user_email("novo@email.com", 1)

    assert result["Update"] is True
    assert result["new_email"] == "novo@email.com"

def test_update_user_email_query(mock_db_users):
    conn, cursor = mock_db_users

    update_user_email("novo@email.com", 1)

    cursor.execute.assert_called_with(
        "UPDATE users SET email = %s WHERE id = %s", ("novo@email.com", 1)
    )
    conn.commit.assert_called_once()
    conn.close.assert_called_once()


# teste da funcao update_user_password
def test_update_user_password(mock_db_users):
    conn, cursor = mock_db_users

    result = update_user_password("novo_hash", 1)

    assert result["Update"] is True


def test_update_user_password_query(mock_db_users):
    conn, cursor = mock_db_users

    update_user_password("novo_hash", 1)

    cursor.execute.assert_called_with(
        "UPDATE users SET password_hash = %s WHERE id = %s", ("novo_hash", 1)
    )

    conn.commit.assert_called_once()
    conn.close.assert_called_once()

# teste da funcao update_user_name
def test_update_user_name(mock_db_users):
    conn, cursor = mock_db_users

    result = update_user_name("Novo Nome", 1)

    assert result["new_name"] == "Novo Nome"


def test_update_user_name_query(mock_db_users):
    conn, cursor = mock_db_users

    update_user_name("Novo Nome", 1)

    cursor.execute.assert_called_with(
        "UPDATE users SET name = %s where id = %s", ("Novo Nome", 1)
    )

    conn.commit.assert_called_once()
    conn.close.assert_called_once()


# teste da funcao update_desactive_user_account
def test_update_desactive_user_account(mock_db_users):
    conn, cursor = mock_db_users

    result = update_desactive_user_account(1)

    assert result["user_id"] == 1
    assert result["Update"] is True


def test_update_desactive_user_account_query(mock_db_users):
    conn, cursor = mock_db_users

    update_desactive_user_account(1)

    cursor.execute.assert_called_with(
        "UPDATE users SET is_active = FALSE WHERE id = %s", (1,)
    )

    conn.commit.assert_called_once()
    conn.close.assert_called_once()