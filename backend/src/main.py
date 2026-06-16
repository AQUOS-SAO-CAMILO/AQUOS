import logging, os
import backend.src.logger as logger

from flask import Flask, request, jsonify
from flask_cors import CORS
from config import Config
from dotenv import load_dotenv

from backend.src.controllers.user_controller import login
from backend.src.controllers.session_controller import session
from backend.src.config.connection import create_connection
from backend.src.DAOS.user_DAO import *
from backend.src.controllers.external_controller import clima
from backend.src.controllers.report_controller import report
from backend.src.controllers.athlete_controller import athlete
from backend.src.controllers.admin_controller import admin
from backend.src.middlewares.auth import init_middlewares

load_dotenv()
_ip = os.getenv("LOCAL_IP", "127.0.0.1")
app = Flask(__name__)
CORS(app,
     origins=["http://localhost:5173", "http://127.0.0.1:5173",
              f"http://{_ip}:5173",
              "capacitor://localhost", "http://localhost"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization"])

app.config.from_object(Config)
if not app.config.get('SECRET_KEY'):
    app.config['SECRET_KEY'] = os.getenv("SECRET_KEY")

logger.setup()
log = logging.getLogger("meuapp")

# lm = LoginManager(app)
connection = create_connection()

init_middlewares(app)

app.register_blueprint(login)
app.register_blueprint(session)
app.register_blueprint(clima)
app.register_blueprint(report)
app.register_blueprint(athlete)
app.register_blueprint(admin)

@app.route("/")
def hello_world():
    return "<p>hello world</p>"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)