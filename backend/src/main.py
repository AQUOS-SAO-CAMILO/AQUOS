import logging
import logger

from flask import Flask
from flask_cors import CORS
from config import Config
from flask_login import LoginManager

from backend.src.config.config import Config
from backend.src.controllers.user_controller import login
from backend.src.controllers.session_controller import session
from backend.src.config.connection import create_connection

logger.setup()

log = logging.getLogger("meuapp")


# Criação de aplicativo Flask
app = Flask(__name__)
lm = LoginManager(app)

# Carregar as configurações do arquivo config.py
app.config.from_object(Config)

# Configuração do CORS (permite requisições de qualquer origem)
CORS(app)

connection = create_connection()

# Registrar os Blueprints para as rotas
# Login 
app.register_blueprint(login)
app.register_blueprint(session)

# alterar isso dps, coloquei só pra testar se tava tudo ok
@app.route("/")
def hello_world():
    return "<p>hello world</p>"

if __name__ == "__main__":
    app.run(debug=True, port=5001) 
