import pytest
from backend.src.services.user_service import (
    authenticate_user_logic, 
    register_user_logic,
    list_all_users_logic,
    update_user_data_logic,
    delete_user_logic
    )

# Teste de autenticação sucesso
def test_authenticate_user_success(mocker):
    
    mock_user = (1, "lulu@email.com", "hash_fake", "lulu", "admin")
    mocker.patch("backend.src.services.user_service.get_all_users_by_email", return_value=mock_user)
    mocker.patch("backend.src.services.user_service.check_password_hash", return_value=True)
    mock_app = mocker.patch("backend.src.services.user_service.current_app")
    mock_app.config = {'SECRET_KEY': 'teste_key'}
    spy_jwt = mocker.patch("backend.src.services.user_service.jwt.encode",return_value="token_fake")

    response = authenticate_user_logic("lulu@email.com", "senha123")

    assert response["token"] == "token_fake"
    assert response["message"] == "Token gerado com sucesso!"

    spy_jwt.assert_called_once()

# teste autenticacao com senha errada
def test_authenticate_user_wrong_password(mocker):
    mock_user = (1, "lulu@email.com", "hash_fake", "lulu", "admin")
    mocker.patch("backend.src.services.user_service.get_all_users_by_email", return_value=mock_user)
    mocker.patch("backend.src.services.user_service.check_password_hash", return_value=False)

    response = authenticate_user_logic("lulu@email.com", "senha_errada")

    assert "error" in response
    assert "Senha incorreta" in response["error"]
    
# teste usuario nao encontrado
def test_authenticate_user_not_found(mocker):
    mocker.patch("backend.src.services.user_service.get_all_users_by_email", return_value=None)

    response = authenticate_user_logic("fantasminha@email.com", "123")

    assert "error" in response
    assert "Usuário não encontrado" in response["error"]

# teste de registro quando o usuario ja existe (alg usa esse email)
def test_register_user_already_exists(mocker):
    mocker.patch("backend.src.services.user_service.get_all_users_by_email", return_value=(1, "juju@email.com"))

    response = register_user_logic("juju@email.com", "senha", "juju")

    assert "error" in response
    assert "Usuário já está cadastrado" in response["error"]

# teste de registro 
def test_register_user(mocker):
    mocker.patch("backend.src.services.user_service.get_all_users_by_email", return_value=None)
    spy_insert = mocker.patch("backend.src.services.user_service.insert_new_user")
    spy_hash = mocker.patch("backend.src.services.user_service.generate_password_hash",return_value="hash_novo")

    register_user_logic("novo@teste.com","senha123","Novo User")

    spy_hash.assert_called_once_with("senha123")
    spy_insert.assert_called_once()


# teste de sucesso de registro ( com hash)
def test_register_user_success(mocker):
    mocker.patch("backend.src.services.user_service.get_all_users_by_email", return_value=None)
    mocker.patch("backend.src.services.user_service.generate_password_hash", return_value="hash_novo")
    spy_insert = mocker.patch("backend.src.services.user_service.insert_new_user")

    email, pwd, name = "novo@teste.com", "senha123", "Novo User"
    response = register_user_logic(email, pwd, name)

    assert response["message"] == "Usuário criado com sucesso!"

    spy_insert.assert_called_once_with(email, "hash_novo", name, "athlete")


# teste listagem de dado com sucesso
def test_list_all_users_success(mocker):
    mock_db_data = [
        (1, "ana@teste.com", "Ana Silva", "admin", True),
        (2, "bob@teste.com", "Bob Souza", "athlete", True)
    ]
    
    mocker.patch("backend.src.services.user_service.get_all_data_users", return_value=mock_db_data)

    response = list_all_users_logic()

    assert response["Count"] == 2
    assert response["users"][0]["name"] == "Ana Silva"
    assert response["users"][1]["email"] == "bob@teste.com"
    assert "message" in response
    assert "error" not in response

# teste nenhum usuario encontrado na listagem
def test_list_all_users_empty(mocker):
    mocker.patch("backend.src.services.user_service.get_all_data_users", return_value=[])

    response = list_all_users_logic()

    assert "error" in response
    assert "Nenhum usuário encontrado" in response["error"]

# teste banco de dados fora do ar
def test_list_all_users_exception(mocker):
    mocker.patch("backend.src.services.user_service.get_all_data_users", side_effect=Exception("Conexão recusada"))

    response = list_all_users_logic()

    assert "error" in response
    assert "Conexão recusada" in response["error"]


# teste atualizacao de todos os dados
def test_update_user_data_success(mocker):
    mocker.patch("backend.src.services.user_service.get_all_users_by_id", return_value=(1, "velho@email.com"))
    spy_email = mocker.patch("backend.src.services.user_service.update_user_email")
    spy_name = mocker.patch("backend.src.services.user_service.update_user_name")
    spy_pass = mocker.patch("backend.src.services.user_service.update_user_password")
    mocker.patch("backend.src.services.user_service.generate_password_hash", return_value="hash_novo")

    response = update_user_data_logic(1, new_email="novo@email.com", new_password="123", new_name="Novo Nome")

    assert response["message"] == "Usuário atualizado com sucesso"
    
    spy_email.assert_called_once_with("novo@email.com", 1)
    spy_name.assert_called_once_with("Novo Nome", 1)
    spy_pass.assert_called_once_with("hash_novo", 1)

# teste atualizar so o nome
def test_update_user_data_name(mocker):
    mocker.patch("backend.src.services.user_service.get_all_users_by_id", return_value=(1, "velho@email.com"))
    
    spy_email = mocker.patch("backend.src.services.user_service.update_user_email")
    spy_name = mocker.patch("backend.src.services.user_service.update_user_name")

    response = update_user_data_logic(1, new_name="Apenas Nome")

    assert response["message"] == "Usuário atualizado com sucesso"
    
    spy_name.assert_called_once_with("Apenas Nome", 1)
    spy_email.assert_not_called()

# teste atualizar so o email
def test_update_user_data_email(mocker):
    mocker.patch("backend.src.services.user_service.get_all_users_by_id", return_value=(1, "velho@email.com"))
    spy_name = mocker.patch("backend.src.services.user_service.update_user_name")
    spy_email = mocker.patch("backend.src.services.user_service.update_user_email")

    response = update_user_data_logic(1, new_email="atualizar@email.com")

    assert response["message"] == "Usuário atualizado com sucesso"
    
    spy_email.assert_called_once_with("atualizar@email.com", 1)
    spy_name.assert_not_called()


# teste atualizar so a senha
def test_update_user_data_password(mocker):
    mocker.patch("backend.src.services.user_service.get_all_users_by_id",return_value=(1, "velho@email.com"))
    spy_pwr = mocker.patch("backend.src.services.user_service.update_user_password")
    spy_email = mocker.patch("backend.src.services.user_service.update_user_email")
    spy_hash = mocker.patch("backend.src.services.user_service.generate_password_hash",return_value="hash novo")
    
    response = update_user_data_logic(1, new_password="senha_nova")

    assert response["message"] == "Usuário atualizado com sucesso"
    
    spy_pwr.assert_called_once_with("hash novo", 1)
    spy_email.assert_not_called()
    spy_hash.assert_called_once_with("senha_nova")

# teste atualizar so que nao foi encontrado o usuario
def test_update_user_data_not_found(mocker):
    mocker.patch("backend.src.services.user_service.get_all_users_by_id", return_value=None)

    response = update_user_data_logic(999, new_name="Teste")

    assert "error" in response
    assert "não encontrado" in response["error"]

# teste deletar usuario com sucesso
def test_delete_user_logic_success(mocker):
    mocker.patch("backend.src.services.user_service.get_all_users_by_id", return_value=(1, "user@email.com"))
    
    spy_desactive = mocker.patch("backend.src.services.user_service.update_desactive_user_account")

    response = delete_user_logic(1)

    assert response["message"] == "Usuário desativado com sucesso!"
    spy_desactive.assert_called_once_with(1)

# teste tentar deletar um usuario q n existe
def test_delete_user_logic_not_found(mocker):
    mocker.patch("backend.src.services.user_service.get_all_users_by_id", return_value=None)

    response = delete_user_logic(999)

    assert "error" in response
    assert "não encontrado" in response["error"]

# teste deletar mas o banco caiu
def test_delete_user_logic_exception(mocker):
    mocker.patch("backend.src.services.user_service.get_all_users_by_id",side_effect=Exception("Banco caiu"))

    response = delete_user_logic(1)

    assert "error" in response
    assert "Banco caiu" in response["error"]
