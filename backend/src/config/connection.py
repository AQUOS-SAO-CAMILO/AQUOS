import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def conectar():
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

    except Exception as e:
        print(f"Erro na conexão com o banco de dados: {e}")

    finally:
        if connection:
            cursor.close()
            connection.close()
            print(f"Conexão do banco de dados encerrada.")

if __name__ == "__main__":
    conectar()