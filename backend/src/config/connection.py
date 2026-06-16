import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def create_connection():
    connection = None
    try:
        connection = psycopg2.connect(
            host = os.getenv("DB_HOST"),
            database = os.getenv("DB_NAME"),
            user = os.getenv("DB_USER"),
            password = os.getenv("DB_PASS"),
            port = os.getenv("DB_PORT")
        )

        cursor = connection.cursor()
        cursor.execute("SELECT version();")
        print(f"Banco de dados conectado com sucesso: {cursor.fetchone()}")
        return connection 

    except Exception as e:
        print(f"Erro na conexão com o banco de dados: {e}")


if __name__ == "__main__":
    create_connection()