from dotenv import load_dotenv
import requests, os
from pathlib import Path
import geocoder
from flask import Blueprint, jsonify

env_path = Path('/home/lua/Documents/AQUOS/.env')
load_dotenv(dotenv_path=env_path)
    
climate_translation = {
    "clear sky": "céu limpo",
    "few clouds": "poucas nuvens",
    "scattered clouds": "nuvens dispersas",
    "broken clouds": "nuvens quebradas",
    "overcast clouds": "nublado",
    "light rain": "chuva leve",
    "moderate rain": "chuva moderada",
    "heavy intensity rain": "chuva forte",
    "thunderstorm": "tempestade",
    "snow": "neve",
    "mist": "névoa",
    "fog": "nevoeiro",
    "haze": "neblina",
}

def get_clima():
    api_key = os.getenv('API_KEY')  
    if not api_key:
        return {"error": "chave de api não encontrada."}, 500

    location = geocoder.ip('me')
    city_name = location.city

    link = f"https://api.openweathermap.org/data/2.5/weather?q={city_name}&appid={(api_key)}"

    request = requests.get(link)
    data = request.json()

    description_en = data['weather'][0]['description']
    description_pt = climate_translation.get(description_en, description_en)
    description = data['weather'][0]['description']
    temperature = round(data['main']['temp'] - 273.15, 1)
    humidity = round(data['main']['humidity'], 1)

    return {
        "weather": {
            "description": description_pt,
            "temperature": temperature,
            "humidity": humidity,
            "city": city_name
        }
    }