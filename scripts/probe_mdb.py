import pyodbc
import os

# Database Path
db_path = os.path.abspath(r"DATASET\data.mdb")

# Connection Strings to Try (Standard logic for Access MDB)
drivers = [
    f"Driver={{Microsoft Access Driver (*.mdb, *.accdb)}};Dbq={db_path};",
    f"Driver={{Microsoft Access Driver (*.mdb)}};Dbq={db_path};",
    f"Provider=Microsoft.Jet.OLEDB.4.0;Data Source={db_path};"
]

connected = False
for conn_str in drivers:
    try:
        print(f"Proping connection with: {conn_str}")
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        print("Connected successfully!")
        
        # List Tables
        print("Tables found:")
        for table_info in cursor.tables(tableType='TABLE'):
            print(f" - {table_info.table_name}")
            
        connected = True
        break
    except Exception as e:
        print(f"Failed: {e}")

if not connected:
    print("Could not connect to MDB. Drivers might be missing.")
