// Загружаем Pyodide
let pyodide = null;
let outputBuffer = [];

async function loadPyodide() {
    const status = document.querySelector('.status');
    status.textContent = 'Загрузка Python...';
    
    try {
        pyodide = await loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/"
        });
        status.textContent = 'Python готов!';
    } catch (error) {
        status.textContent = 'Ошибка загрузки Python';
        console.error(error);
    }
}

// Инициализация редактора кода
document.addEventListener('DOMContentLoaded', function() {
    // Конфигурация Skulpt
    function outf(text) {
        const output = document.getElementById("output");
        output.innerHTML += text;
    }

    function builtinRead(x) {
        if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined)
            throw "File not found: '" + x + "'";
        return Sk.builtinFiles["files"][x];
    }

    // Функция для выполнения кода
    function runPython() {
        const prog = document.getElementById("code-editor").value;
        const output = document.getElementById("output");
        output.innerHTML = '';

        Sk.configure({
            output: outf,
            read: builtinRead,
            __future__: Sk.python3,
            inputfun: function(prompt) {
                return new Promise((resolve, reject) => {
                    const userInput = window.prompt(prompt);
                    resolve(userInput);
                });
            }
        });

        const myPromise = Sk.misceval.asyncToPromise(function() {
            return Sk.importMainWithBody("<stdin>", false, prog, true);
        });

        myPromise.then(
            function(mod) {
                console.log('Успешное выполнение');
            },
            function(err) {
                output.innerHTML += `<span class="error">\nОшибка: ${err.toString()}</span>`;
            }
        );
    }

    // Обработчики событий
    document.querySelector('.run-button').addEventListener('click', runPython);

    const codeEditor = document.getElementById('code-editor');

    // Поддержка Tab в textarea
    codeEditor.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = this.selectionStart;
            const end = this.selectionEnd;
            this.value = this.value.substring(0, start) + 
                        "    " + 
                        this.value.substring(end);
            this.selectionStart = this.selectionEnd = start + 4;
        }
        // Запуск кода по Shift+Enter
        if (e.key === 'Enter' && e.shiftKey) {
            e.preventDefault();
            runPython();
        }
    });

    // Обработчики для кнопок очистки
    document.querySelector('.clear-btn').addEventListener('click', () => {
        codeEditor.value = '';
        codeEditor.focus();
    });

    document.querySelector('.clear-output').addEventListener('click', () => {
        document.getElementById('output').innerHTML = '';
    });

    // Плавная прокрутка к интерактивному режиму
    document.querySelector('.practice-btn').addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector('#interactive').scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    });

    // Устанавливаем начальный код
    codeEditor.value = `# Пример кода на Python
print("Привет, мир!")
name = "Python"
print(f"Я изучаю {name}!")`;

    // Примеры кода
    const examples = {
        'Простой вывод': 'print("Привет, мир!")',
        'Математика': `# Простые математические операции
a = 5
b = 3
print(f"Сумма: {a + b}")
print(f"Разность: {a - b}")
print(f"Произведение: {a * b}")
print(f"Деление: {a / b}")`,
        'Списки': `# Работа со списками
numbers = [1, 2, 3, 4, 5]
print("Список:", numbers)
print("Сумма:", sum(numbers))
print("Максимум:", max(numbers))
print("Минимум:", min(numbers))`
    };

    // Обработчик вкладки с примерами
    document.querySelector('[data-tab="examples"]').addEventListener('click', function() {
        const examplesHtml = Object.entries(examples)
            .map(([name, code]) => `
                <div class="example-item">
                    <h3>${name}</h3>
                    <pre>${code}</pre>
                    <button class="load-example">Загрузить</button>
                </div>
            `).join('');
        
        document.querySelector('.editor-container').innerHTML = examplesHtml;
        
        // Обработчики для загрузки примеров
        document.querySelectorAll('.load-example').forEach(button => {
            button.addEventListener('click', function() {
                const code = this.previousElementSibling.textContent;
                codeEditor.value = code;
                document.querySelector('[data-tab="editor"]').click();
            });
        });
    });

    // Плавная прокрутка к разделам
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const section = document.querySelector(this.getAttribute('href'));
            section.scrollIntoView({ behavior: 'smooth' });
        });
    });
}); 