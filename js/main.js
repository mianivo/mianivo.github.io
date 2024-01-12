const api = `http://81.177.165.51:5000/api/direction_list`;


const addButton = document.querySelector('.addButton');
const disciplineList = document.querySelector('.list__discipline');
const template = document.getElementById('template__form');
const template2 = document.getElementById('template__form-2');
const comparisonList = document.querySelector('.comparison__result .list__discipline');
const disciplinesData = [];

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
  const input = document.getElementById('directionInput');
  const filter = input.value.toUpperCase();
  const autocompleteList = document.getElementById('autocomplete-list');

  if (input.value === '') {
      autocompleteList.style.display = 'none';
      return
  }

  const autocompleteData = await fetchData();

  const matchingDisciplines = autocompleteData.filter(item => {
      const txtValue = item.toUpperCase();
      return txtValue.indexOf(filter) > -1;
  });

  if (matchingDisciplines.length > 0) {
      autocompleteList.style.display = 'block';
      autocompleteList.innerHTML = ''; 

      const maxItems = 5;
      let displayedItems = 0;

      matchingDisciplines.forEach(function(item) {
        var txtValue = item;
        if (displayedItems < maxItems) {
            const div = document.createElement('div');
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
      autocompleteList.style.display = 'none';
  }
}

window.addEventListener('scroll', () => {
    const scroll = document.querySelector('.u-upward');
    scroll.classList.toggle('active', window.scrollY > 500)
    })
const uScrollTop = () => {
    window.scrollTo({
    top: 0,
    behavior: 'smooth'
    })
}

addButton.addEventListener('click', function () {
    const name = document.getElementById('disciplineInput').value;
    const hours = parseInt(document.getElementById('countItemsInput').value, 10);
    const semestr = parseInt(document.getElementById('semesterSelect').value, 10);
    const is_exam = document.getElementById('verificationInput').value === 'Экзамен';
    
    const clone = template.content.cloneNode(true);
    clone.querySelector('#outputDiscipline').value = name;
    clone.querySelector('#outputCountItems').value = hours;
    clone.querySelector('#outputSemester').value = semestr;
    clone.querySelector('#outputVerificationForm').value = is_exam ? 'Экзамен' : 'Зачет';

    disciplinesData.push({
        name,
        hours,
        semestr,
        is_exam
    });

    disciplineList.appendChild(clone);

    document.getElementById('disciplineInput').value = '';
    document.getElementById('countItemsInput').value = '';
    document.getElementById('semesterSelect').value = '';
    document.getElementById('verificationInput').value = '';

    console.log(...disciplinesData)

});
disciplineList.addEventListener('click', function (event) {
    if (event.target.classList.contains('u-button-danger')) {
        document.getElementById('output__result').value = '';
        document.getElementById('output__result-credit').value = '';
        const listItem = event.target.closest('.form-list');
        const index = Array.from(disciplineList.children).indexOf(listItem);

        const comparisonItem = comparisonList.children[index];
        if(comparisonItem){
            comparisonItem.remove();
        }
        listItem.remove();
        disciplinesData.splice(index, 1);
    }
});

const form = document.getElementById("send__form");
form.addEventListener("submit", async function(event) {
    event.preventDefault();

    comparisonList.innerHTML = '';

    const directionInputValue = document.getElementById("directionInput").value;
    const semesterDirectionSelectValue = document.getElementById("semesterDirectionSelect").value;
    const userData = {
        direction_name: directionInputValue,
        semestr: +semesterDirectionSelectValue,
        diciplines: [
        ]
    };
    disciplinesData.forEach((disciplineData) => {
        userData.diciplines.push({
            name: disciplineData.name,
            hours: disciplineData.hours,
            semestr: disciplineData.semestr,
            is_exam: disciplineData.is_exam
        });
    });
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
    const responseData = await response.json();
    console.log(responseData.compare)
    console.log(responseData)


    responseData.compare.forEach((disciplineData) => {
        const clone2 = template2.content.cloneNode(true);

        if (disciplineData.direction_discipline === null) {
            clone2.querySelector('#outputCountItemsDifferentPlan').style.backgroundColor = '#A7A7A7';
            clone2.querySelector('#outputNeedVerificationForm-1').value = '—';
            clone2.querySelector('#outputYourDiscipline').value = disciplineData.user_discipline.name;
            clone2.querySelector('#outputCountItems').value = disciplineData.user_discipline.hours;
            clone2.querySelector('#outputYourVerificationForm-1').value = disciplineData.user_discipline.is_exam ? 'Экзамен' : 'Зачет';
            clone2.querySelector('#numberYourSemestr').textContent = disciplineData.user_discipline.semestr;
        } else if(disciplineData.user_discipline === null) {
            clone2.querySelector('#outputCountItems').style.backgroundColor = '#EF302B';
            clone2.querySelector('#outputYourVerificationForm-1').value = '—';
            clone2.querySelector('#outputNeedDiscipline').value = disciplineData.direction_discipline[0];
            clone2.querySelector('#outputCountItemsDifferentPlan').value = disciplineData.direction_discipline[1];; // Set as needed
            clone2.querySelector('#outputNeedVerificationForm-1').value = disciplineData.direction_discipline[2] ? 'Экзамен' : 'Зачет'; // Set as needed
            clone2.querySelector('#numberNeedSemestr').textContent = disciplineData.direction_discipline[3];
        }else{
            clone2.querySelector('#outputYourDiscipline').value = disciplineData.user_discipline.name;
            clone2.querySelector('#outputNeedDiscipline').value = disciplineData.direction_discipline[0];
            clone2.querySelector('#outputCountItems').value = disciplineData.user_discipline.hours;
            clone2.querySelector('#outputCountItemsDifferentPlan').value = disciplineData.direction_discipline[1]; // Set as needed
            clone2.querySelector('#outputYourVerificationForm-1').value = disciplineData.user_discipline.is_exam ? 'Экзамен' : 'Зачет';
            clone2.querySelector('#outputNeedVerificationForm-1').value = disciplineData.direction_discipline[2] ? 'Экзамен' : 'Зачет'; // Set as needed
            clone2.querySelector('#numberYourSemestr').textContent = disciplineData.user_discipline.semestr;
            clone2.querySelector('#numberNeedSemestr').textContent = disciplineData.direction_discipline[3];
        }
        comparisonList.appendChild(clone2);
    });
    const academyCredit = document.querySelector('#output__result-credit').value = responseData.academy_credit;
    const outputResult = document.querySelector('#output__result');
    outputResult.value = academyCredit > 0 ? 'Нет' : 'Да';
    outputResult.style.color = academyCredit > 0 ? '#EF302B' : '#3BA68C';
});