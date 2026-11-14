#!/usr/bin/env python3
"""
ZAR & ARZ 3D • Server Launcher
Routes execution to backend/app.py
"""

import sys
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(BASE_DIR, "backend")
sys.path.insert(0, BACKEND_DIR)

from app import main

if __name__ == "__main__":
  main()
