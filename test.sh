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

## Частина 3: Запити до http.cat

# 8. GET - автоматичне завантаження з http.cat для коду 200 (200 OK)
curl -v http://localhost:10000/200 -o downloaded_200.jpg

# 9. GET - автоматичне завантаження з http.cat для коду 404 (200 OK)
curl -v http://localhost:10000/404 -o downloaded_404.jpg

# 10. GET - автоматичне завантаження з http.cat для коду 500 (200 OK)
curl -v http://localhost:10000/500 -o downloaded_500.jpg

# 11. Перевірка кешу - файли мають бути в директорії ./test-cache/
ls -la ./test-cache/

# 12. GET - повторний запит для коду 200 (має взяти з кешу)
curl -v http://localhost:10000/200

# 13. GET - неіснуючий код статусу (404 Not Found)
curl -v http://localhost:10000/999

# 14. DELETE - видалення картинки з кешу (200 OK)
curl -v -X DELETE http://localhost:10000/200

# 15. GET - після видалення (знову завантажить з http.cat)
curl -v http://localhost:10000/200
