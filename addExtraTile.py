import sqlite3 

db = sqlite3.connect('wordspot.db')
c = db.cursor()

#letters = [(9, 1, 3, 'A', 0), (10, 1, 3, 'B', 1), (11, 1, 3, 'C', 2), (12, 1, 3, 'D', 3)]
letters = [(1, 1, 1, 'E', 0), (2, 1, 1, 'F', 1), (3, 1, 1, 'G', 2), (4, 1, 1, 'H', 3)]
c.executemany("INSERT INTO ExtraTile VALUES (?, ?, ?, ?, ?)", letters)

db.commit()
db.close()