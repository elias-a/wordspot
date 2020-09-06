import sqlite3 

db = sqlite3.connect('wordspot.db')
c = db.cursor()

letters = [(5, 1, 2, 'A', 0), (6, 1, 2, 'B', 1), (7, 1, 2, 'C', 2), (8, 1, 2, 'D', 3)]
#letters = [(1, 1, 1, 'E', 0), (2, 1, 1, 'F', 1), (3, 1, 1, 'G', 2), (4, 1, 1, 'H', 3)]
c.executemany("INSERT INTO ExtraTile VALUES (?, ?, ?, ?, ?)", letters)

db.commit()
db.close()