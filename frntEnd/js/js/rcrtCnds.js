const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 5000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
});

$(document).ready(() => {
  var getCnds = () => {
    const inputIds = [
      'SectorF',
      'functionF',
      'regionF',
      'salaireF',
      'etudF',
      'formationF',
      'expF',
      'langsF',
    ];

    const jsonData = {};

    inputIds.forEach((id) => {
      const inputElement = document.getElementById(id);

      if (inputElement && inputElement.value) {
        jsonData[id] = inputElement.value;
      }
    });
    fetch('/Recrutement/Candidats/getCnds', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jsonData),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(`Error: ${response.statusText}`);
        }
      })
      .then((data) => {
        $('#CndsTbl').html(data);
        console.log(data);
      })
      .catch((error) => {
        console.error('Error:', error.message);
      });
  };

  getCnds();
});
