const api = `http://81.177.165.51:5000/api/direction_list`;


const addButton = document.querySelector('.addButton');
const disciplineList = document.querySelector('.list__discipline');
const template = document.getElementById('template__form');
const template2 = document.getElementById('template__form-2');
const comparisonList = document.querySelector('.comparison__result .list__discipline');
const disciplinesData = []; // Массив для хранения данных дисциплин

async function fetchData() {
  try {
      const response = await fetch(`${api}`);
      const data = await response.json();
      return data;
  } catch (error) {
      console.error('Error fetching data:', error);
      return [];
  }
}

async function showAutocomplete() {
  var input = document.getElementById('directionInput');
  var filter = input.value.toUpperCase();
  var autocompleteList = document.getElementById('autocomplete-list');

  // Если поле ввода пустое, скрыть выпадающий список
  if (input.value === '') {
      autocompleteList.style.display = 'none';
  }

  // Загрузить данные из сервера
  const autocompleteData = await fetchData();

  // Фильтровать элементы
  const matchingDisciplines = autocompleteData.filter(item => {
      var txtValue = item.toUpperCase();
      return txtValue.indexOf(filter) > -1;
  });

  // Если есть совпадения, показать выпадающий список
  if (matchingDisciplines.length > 0) {
      autocompleteList.style.display = 'block';
      autocompleteList.innerHTML = ''; // Очистить предыдущие элементы списка

      // Ограничение до 5 элементов
      const maxItems = 5;
      let displayedItems = 0;

      matchingDisciplines.forEach(function(item) {
        var txtValue = item;
        if (displayedItems < maxItems) {
            var div = document.createElement('div');
            div.textContent = txtValue;
            div.onclick = function() {
                input.value = txtValue;
                autocompleteList.style.display = 'none';
            };
            autocompleteList.appendChild(div);
            displayedItems++;
        }
      });
  } else {
      // Если нет совпадений, скрыть выпадающий список
      autocompleteList.style.display = 'none';
  }
}

window.addEventListener('scroll', () => {
    var scroll = document.querySelector('.u-upward');
    scroll.classList.toggle('active', window.scrollY > 500)
    })
const uScrollTop = () => {
    window.scrollTo({
    top: 0,
    behavior: 'smooth'
    })
}


addButton.addEventListener('click', function () {
    // Получаем значения полей формы
    const disciplineInput = document.getElementById('disciplineInput').value;
    const countItemsInput = document.getElementById('countItemsInput').value;
    const semesterSelect = document.getElementById('semesterSelect').value;
    const verificationInput = document.getElementById('verificationInput').value;
    

    // const disciplineData = {
    //     name: disciplineInput,
    //     hours: countItemsInput,
    //     semester: semesterSelect,
    //     is_exam: verificationInput
    // };
    // disciplinesData.push(disciplineData);

    // Клонируем шаблон и заполняем его данными
    const clone = template.content.cloneNode(true);
    clone.querySelector('#outputDiscipline').value = disciplineInput;
    clone.querySelector('#outputCountItems').value = countItemsInput;
    clone.querySelector('#outputSemester').value = semesterSelect;
    clone.querySelector('#outputVerificationForm').value = verificationInput;

    disciplinesData.push({
        disciplineInput,
        countItemsInput,
        semesterSelect,
        verificationInput
    });

    // Добавляем клон к списку дисциплин
    disciplineList.appendChild(clone);

    // Очищаем поля формы
    document.getElementById('disciplineInput').value = '';
    document.getElementById('countItemsInput').value = '';
    document.getElementById('semesterSelect').value = '';
    document.getElementById('verificationInput').value = '';
});
disciplineList.addEventListener('click', function (event) {
    if (event.target.classList.contains('u-button-danger')) {
        document.getElementById('output__result').value = '';
        document.getElementById('output__result-credit').value = '';
        const listItem = event.target.closest('.form-list');
        const index = Array.from(disciplineList.children).indexOf(listItem);

        // Remove corresponding template__form-2 element
        const comparisonItem = comparisonList.children[index];
        comparisonItem.remove();

        // Remove template__form element
        listItem.remove();

        // Remove corresponding data from disciplinesData array
        disciplinesData.splice(index, 1);
    }
});

var form = document.getElementById("send__form");
form.addEventListener("submit", async function(event) {+-+-
    event.preventDefault();

    // Получение данных из полей ввода
    var inputs = document.getElementsByClassName("form-list");
    for ( var i = 0; i < form.elements.length; i++ ) {
        var e = form.elements[i];
        alert(e.getElementsByClassName)
    }


        var outputDiscipline = document.getElementById("outputDiscipline").value;
    var outputCountItems = document.getElementById("outputCountItems").value;
    var outputSemester = document.getElementById("outputSemester").value;
    var outputVerificationForm = document.getElementById("outputVerificationForm").value;

    comparisonList.innerHTML = '';

    // Создаем экземпляры второго шаблона для каждой добавленной дисциплины
    disciplinesData.forEach((disciplineData) => {
        const clone2 = template2.content.cloneNode(true);
        clone2.querySelector('#outputYourDiscipline').value = disciplineData.disciplineInput;
        clone2.querySelector('#outputCountItems').value = disciplineData.countItemsInput;
        clone2.querySelector('#outputCountItemsDifferentPlan').value = ''; // Set as needed
        clone2.querySelector('#outputYourVerificationForm-1').value = disciplineData.verificationInput;
        clone2.querySelector('#outputNeedVerificationForm-1').value = ''; // Set as needed

        // Добавляем клон к списку второго списка (результата сравнения)
        comparisonList.appendChild(clone2);
    });

    var userData = {
        direction_name: "Программная инженерия",
        semestr: 1,
        diciplines: [
            {
                name: outputDiscipline,
                hours: +outputCountItems,
                semestr: +outputSemester,
                is_exam: outputVerificationForm === "Экзамен"
            }
        ]
    };

    // Отправка данных на сервер
    const response = await fetch("http://81.177.165.51:5000/api/academic_credit_calculator", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
    });

    if (!response.ok) {
        throw new Error("Сетевая ошибка: " + response.status);
    }

    // Обработка ответа от сервера
    const responseData = await response.json();
    console.log(responseData)
    if (responseData.compare && Array.isArray(responseData.compare)) {
        const firstItem = responseData.compare[0];

        if (firstItem) {
            console.log(firstItem);
            result(firstItem.direction_discipline, firstItem.academy_credit, firstItem.user_discipline);
            // Here you can perform necessary actions with the first discipline
        }
    } else {
        console.error("Ответ от сервера не содержит ожидаемого массива compare.");
    }
    

});

function result (data, academyСredit, userDiscipline) {
    console.log(data)
    if(data === null){
        document.getElementById('outputNeedDiscipline').style.backgroundColor = 'grey';
        document.getElementById('outputCountItemsDifferentPlan').style.backgroundColor = 'grey';
        document.getElementById('outputNeedVerificationForm-1').value = '-';
        document.getElementById('output__result').value = 'Да';
        document.getElementById('output__result').style.color = '#3BA68C66';

    }else{
        document.getElementById('outputNeedDiscipline').value = data[0]
        document.getElementById('outputCountItemsDifferentPlan').value = data[1]
        if(data[2] === false){
            document.getElementById('outputNeedVerificationForm-1').value = 'Зачёт'
        }else{
            document.getElementById('outputNeedVerificationForm-1').value = 'Экзамен'
        }
        // if(document.getElementById('outputNeedVerificationForm-1').value)
        // document.getElementById('outputNeedVerificationForm-1').value = formExam
        document.getElementById('output__result-credit').value = academyСredit
        if(academyСredit <= 0 & data[2] === userDiscipline.is_exam){
            document.getElementById('output__result').value = 'Да';
            document.getElementById('output__result').style.color = '#3BA68C66';
        }
        else{
            document.getElementById('output__result').value = 'Нет';
            document.getElementById('output__result').style.color = 'red';
        }
    }
}