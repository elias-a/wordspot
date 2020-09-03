import sqlite3 

db = sqlite3.connect('wordspot.db')
c = db.cursor()

letters = [(5, 1, 2, 'A', 0), (6, 1, 2, 'B', 1), (7, 1, 2, 'C', 2), (8, 1, 2, 'D', 3)]
c.executemany("INSERT INTO ExtraTile VALUES (?, ?, ?, ?, ?)", letters)

db.commit()
db.close()