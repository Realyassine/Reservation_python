@echo off
echo Creating Python 3.10 virtual environment...
py -3.10 -m venv venv
echo.
echo Activating virtual environment...
call venv\Scripts\activate
echo.
echo Installing requirements...
pip install -r requirements.txt
echo.
echo Virtual environment setup complete!
echo.
echo To activate the environment in the future, run: venv\Scripts\activate
echo To run the server after activation, use: python manage.py runserver