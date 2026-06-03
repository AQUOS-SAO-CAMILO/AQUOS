from dotenv import load_dotenv
import requests, os
from pathlib import Path
import geocoder

env_path = Path('/home/lua/Documents/AQUOS/.env')
load_dotenv(dotenv_path=env_path)

api_key = os.getenv('API_KEY')  
if not api_key:
    print("chave de api não encontrada.")

location = geocoder.ip('me')
city_name = location.city
print("city_name: " + city_name)

link = f"https://api.openweathermap.org/data/2.5/weather?q={city_name}&appid={(api_key)}"

request = requests.get(link)
request_dict = request.json()
description = request_dict['weather'][0]['description']
temperature = request_dict['main']['temp'] - 273.15
humidity = request_dict['main']['humidity']

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

description_en = request_dict['weather'][0]['description']
description_pt = climate_translation.get(description_en, description_en)

print("\nweather: " + description,f"\ntemperature: {round(temperature, 1)}*C", "\nhumidity: ", humidity)
print(f"\ntempo: {description_pt}")
print(f"temperatura; {round(temperature, 1)}°C")
print(f"umidade {humidity}%")