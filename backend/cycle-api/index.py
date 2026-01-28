import json
import os
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import RealDictCursor
import secrets

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: dict, context) -> dict:
    '''API для управления данными о менструальном цикле'''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    path = event.get('queryStringParameters', {}).get('action', '')
    
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'POST' and path == 'create_user':
            body = json.loads(event.get('body', '{}'))
            birth_year = body.get('birth_year')
            usage_mode = body.get('usage_mode')
            goals = body.get('goals', [])
            
            cur.execute(
                "INSERT INTO users (birth_year, usage_mode, partner_code) VALUES (%s, %s, %s) RETURNING id",
                (birth_year, usage_mode, secrets.token_urlsafe(8))
            )
            user_id = cur.fetchone()['id']
            
            for goal in goals:
                cur.execute(
                    "INSERT INTO user_goals (user_id, goal_type) VALUES (%s, %s) ON CONFLICT DO NOTHING",
                    (user_id, goal)
                )
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'user_id': user_id}),
                'isBase64Encoded': False
            }
        
        elif method == 'GET' and path == 'get_user':
            user_id = event.get('queryStringParameters', {}).get('user_id')
            
            cur.execute("SELECT * FROM users WHERE id = %s", (user_id,))
            user = cur.fetchone()
            
            if not user:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'User not found'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("SELECT goal_type FROM user_goals WHERE user_id = %s", (user_id,))
            goals = [row['goal_type'] for row in cur.fetchall()]
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({**dict(user), 'goals': goals}),
                'isBase64Encoded': False
            }
        
        elif method == 'POST' and path == 'add_cycle':
            body = json.loads(event.get('body', '{}'))
            user_id = body.get('user_id')
            start_date = body.get('start_date')
            
            cur.execute(
                "INSERT INTO cycles (user_id, start_date) VALUES (%s, %s) RETURNING id",
                (user_id, start_date)
            )
            cycle_id = cur.fetchone()['id']
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'cycle_id': cycle_id}),
                'isBase64Encoded': False
            }
        
        elif method == 'GET' and path == 'get_cycles':
            user_id = event.get('queryStringParameters', {}).get('user_id')
            
            cur.execute(
                "SELECT * FROM cycles WHERE user_id = %s ORDER BY start_date DESC LIMIT 10",
                (user_id,)
            )
            cycles = cur.fetchall()
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps([dict(c) for c in cycles], default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST' and path == 'save_daily_note':
            body = json.loads(event.get('body', '{}'))
            user_id = body.get('user_id')
            note_date = body.get('note_date')
            mood = body.get('mood')
            energy_level = body.get('energy_level')
            sleep_quality = body.get('sleep_quality')
            
            cur.execute(
                '''INSERT INTO daily_notes (user_id, note_date, mood, energy_level, sleep_quality)
                   VALUES (%s, %s, %s, %s, %s)
                   ON CONFLICT (user_id, note_date)
                   DO UPDATE SET mood = EXCLUDED.mood, energy_level = EXCLUDED.energy_level,
                                 sleep_quality = EXCLUDED.sleep_quality
                   RETURNING id''',
                (user_id, note_date, mood, energy_level, sleep_quality)
            )
            note_id = cur.fetchone()['id']
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'note_id': note_id}),
                'isBase64Encoded': False
            }
        
        elif method == 'GET' and path == 'get_articles':
            cur.execute("SELECT * FROM articles ORDER BY created_at DESC")
            articles = cur.fetchall()
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps([dict(a) for a in articles], default=str),
                'isBase64Encoded': False
            }
        
        else:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid action'}),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
