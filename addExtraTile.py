import sqlite3 

db = sqlite3.connect('wordspot.db')
c = db.cursor()

letters = [(1, 1, 1, 'A', 0), (2, 1, 1, 'B', 1), (3, 1, 1, 'C', 2), (4, 1, 1, 'D', 3)]
c.executemany("INSERT INTO ExtraTile VALUES (?, ?, ?, ?, ?)", letters)

db.commit()
db.close()