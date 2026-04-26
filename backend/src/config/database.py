# Banco falso em memória, para fins de teste
def create_connection():
    return MockConnection()

class MockConnection:
    def __init__(self):
        self.users_data = {
            "admin": {"user": "admin", "password": "admin123", "id": 1},
            "joao": {"user": "joao", "password": "123456", "id": 2},
            "maria": {"user": "maria", "password": "senha123", "id": 3}
        }
        self.next_id = 4  # Para inserir novos usuários
    
    def cursor(self):
        return MockCursor(self.users_data, self)
    
    def close(self):
        print("Conexão mock fechada")
    
    def commit(self):
        pass
    
    def rollback(self):
        pass

class MockCursor:
    def __init__(self, users_data, connection=None):
        self.users_data = users_data
        self.connection = connection
        self.result = None
    
    def execute(self, query, params=None):
        query_lower = query.lower()
        
        # SELECT com WHERE (busca um usuário)
        if "where user =" in query_lower:
            if params:
                user = params[0]
                if user in self.users_data:
                    user_data = self.users_data[user]
                    # Retorna (user, password, id)
                    self.result = [(
                        user_data["user"],
                        user_data["password"],
                        user_data["id"]
                    )]
                else:
                    self.result = []
        
        # SELECT sem WHERE (busca todos)
        elif "select * from users" in query_lower:
            self.result = []
            for user_data in self.users_data.values():
                self.result.append((
                    user_data["user"],
                    user_data["password"],
                    user_data["id"]
                ))
        
        # INSERT
        elif "insert" in query_lower:
            if params:
                user, password = params
                if user not in self.users_data:
                    self.users_data[user] = {
                        "user": user,
                        "password": password,
                        "id": self.connection.next_id
                    }
                    self.connection.next_id += 1
                self.result = []

        elif "update" in query_lower:
            if len(params) == 3:
                new_user, new_password, user_id = params
                for user_data in self.users_data.values():
                    if user_data["id"] == user_id:
                        if new_user:
                            user_data["user"] = new_user
                        if new_password:
                            user_data["password"] = new_password
                        break
            elif len(params) == 2:
                new_user, user_id = params
                for user_data in self.users_data.values():
                    if user_data["id"] == user_id:
                        user_data["user"] = new_user
                        break

        elif "delete" in query_lower:
            if params:
                user_id = params[0]
                to_delete = None
                for key, user_data in self.users_data.items():
                    if user_data["id"] == user_id:
                        to_delete = key
                        break
                
                if to_delete:
                    del self.users_data[to_delete]
                    print(f"Usuário com id {user_id} deletado com sucesso!")
                else:
                    print(f"Erro. Usuário com o id {user_id} não encontrado")
            
            self.result = []

    def fetchone(self):
        return self.result[0] if self.result else None
    
    def fetchall(self):  # ← ADICIONE ESTE MÉTODO
        return self.result if self.result else []
    
    def close(self):
        pass