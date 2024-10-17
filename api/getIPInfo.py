import json
import requests

def handler(request):
    # Only allow GET requests
    if request.method != 'GET':
        return {
            'statusCode': 405,
            'body': json.dumps({'message': 'Method not allowed'}),
            'headers': {
                'Access-Control-Allow-Origin': '*',  # Allow all origins
                'Content-Type': 'application/json'
            }
        }

    # Get IP from query parameters
    ip = request.args.get('ip')
    api_token = 'f0b8fb50fc925f'  # Replace with your actual token
    APIEndpoint = f'https://ipinfo.io/{ip}?token={api_token}'

    try:
        response = requests.get(APIEndpoint)
        response.raise_for_status()  # Raise an error for bad responses
        data = response.json()  # Parse JSON data
        return {
            'statusCode': 200,
            'body': json.dumps(data),  # Return data as JSON
            'headers': {
                'Access-Control-Allow-Origin': '*',  # Allow all origins
                'Content-Type': 'application/json'
            }
        }
    except requests.RequestException as error:
        print('Error:', error)
        return {
            'statusCode': 500,
            'body': json.dumps({'message': 'Internal server error'}),
            'headers': {
                'Access-Control-Allow-Origin': '*',  # Allow all origins
                'Content-Type': 'application/json'
            }
        }
