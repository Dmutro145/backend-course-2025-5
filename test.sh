# Тестування HTTP методів для проксі-сервера
# Сервер запускається: npm run dev -- --host localhost --port 10000 --cache ./test-cache

# 1. GET - картинки немає (404 Not Found)
curl -v http://localhost:10000/200

# 2. POST - метод не підтримується (405 Method Not Allowed)
curl -v -X POST http://localhost:10000/200

# 3. PATCH - метод не підтримується (405 Method Not Allowed)  
curl -v -X PATCH http://localhost:10000/200

# 4. PUT - додати картинку (201 Created)
echo "test image data" | curl -v -X PUT http://localhost:10000/200 --data-binary @-

# 5. GET - картинка є (200 OK + Content-Type: image/jpeg)
curl -v http://localhost:10000/200

# 6. DELETE - видалити картинку (200 OK)
curl -v -X DELETE http://localhost:10000/200

# 7. GET - картинки немає (404 Not Found)
curl -v http://localhost:10000/200
