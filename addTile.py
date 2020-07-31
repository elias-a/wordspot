import sqlite3 

db = sqlite3.connect('wordspot.db')
c = db.cursor()

tile = (17, 4, 3, 1)
c.execute("INSERT INTO Tile VALUES (?, ?, ?, ?)", tile)

letters = [(65, 'A', 17, 0, 0), (66, 'B', 17, 1, 0), (67, 'C', 17, 2, 0), (68, 'D', 17, 3, 0)]
c.executemany("INSERT INTO Letter VALUES (?, ?, ?, ?, ?)", letters)

db.commit()
db.close()