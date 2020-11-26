import csv
import sqlite3
import bcrypt

db = sqlite3.connect('wordspot.db')
c = db.cursor()

# Create User table
c.execute("""CREATE TABLE IF NOT EXISTS User (
    id INTEGER,
    username VARCHAR(255),
    password VARCHAR(255),
    PRIMARY KEY (id)
)
""")

# Create Game table
c.execute(""" CREATE TABLE IF NOT EXISTS Game (
    id INTEGER,
    name VARCHAR(255),
    PRIMARY KEY (id)
)
""")

# Create Player table
c.execute("""CREATE TABLE IF NOT EXISTS Player (
    id INTEGER,
    name INTEGER,
    game INTEGER,
    turn TINYINT(1),
    tokens INTEGER,
    winner TINYINT(1),
    PRIMARY KEY (id),
    FOREIGN KEY (name) REFERENCES User(id),
    FOREIGN KEY (game) REFERENCES Game(id)
)
""")

# Create Tile table
c.execute("""CREATE TABLE IF NOT EXISTS Tile (
    id INTEGER,
    game INTEGER,
    row INTEGER,
    column INTEGER,
    letters VARCHAR(255),
    clicked VARCHAR(255),
    PRIMARY KEY (id),
    FOREIGN KEY (game) REFERENCES Game(id)
)
""")

# Create AvailableTile table
c.execute("""CREATE TABLE IF NOT EXISTS AvailableTile (
    id INTEGER,
    game INTEGER,
    letters VARCHAR(255),
    PRIMARY KEY (id),
    FOREIGN KEY (game) REFERENCES Game(id)
)
""")

# Create ExtraTile table
c.execute("""CREATE TABLE IF NOT EXISTS ExtraTile (
    id INTEGER,
    player INTEGER,
    letters VARCHAR(255),
    PRIMARY KEY (id),
    FOREIGN KEY (player) REFERENCES Player(id)
)
""")

# Seed database with users read from CSV file
users = []
with open('params.csv', 'r', encoding='utf-8') as f:
  reader = csv.DictReader(f)

  for i, row in enumerate(reader):
    username = row['Username']
    password = row['Password']
    
    salt = bcrypt.gensalt()
    password = bcrypt.hashpw(password.encode('ascii'), salt).decode('ascii')

    users.append((i + 1, username, password))

c.executemany("INSERT INTO User VALUES (?, ?, ?)", users)

db.commit()
db.close()