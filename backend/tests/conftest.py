import os

# חייב לרוץ לפני שמייבאים את app — כדי שהבדיקות ישתמשו במסד נפרד
os.environ["DATABASE_URL"] = "sqlite:///./test_ofek.db"
