




$(document).ready(() =>{
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 5000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });
    var getAllEntties = ()=>{
      fetch("/Finance/getEntties")
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          console.error(data.error);
        } else {
          $('#enttiesTble').html(data)
          // console.log(data);
          // $("#cnjTbleBdy").html(data.cnj);
          // $("#soldConge").html(data.sc);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
    }
    $('#logoInpt').on('change', function() {
      var file = this.files[0];
      if (file && file.type !== 'image/png') {
        Toast.fire({
          icon: "error",
          title: "Veuillez télécharger une image au format PNG uniquement.",
        });
          this.value = '';
      }
  });
    $('#sveNewEntty').click(()=>{
      if ($('#NomEntite').val() && $('#RCEntite').val() && $('#ICEEntite').val() && $('#IdentifiantFiscal').val() && $('#TP').val() && $('#FormJrdq').val() && $('#logoInpt').val()) {
        var formData = new FormData();
        formData.append('nme', $('#NomEntite').val());
        formData.append('rc', $('#RCEntite').val());
        formData.append('ice', $('#ICEEntite').val());
        formData.append('if', $('#IdentifiantFiscal').val());
        formData.append('tp', $('#TP').val());
        formData.append('formJ', $('#FormJrdq').val());
        formData.append('cptl', $('#Capital').val());
        formData.append('addr', $('#Adresse').val());
        formData.append('logo', $('#logoInpt')[0].files[0]); 

      $.ajax({
        type: "POST",
        url: "/Finance/sveNewEnttie",
        data: formData,
        contentType: false,
        processData: false,
        success: function(response) {
          Toast.fire({
            icon: "success",
            title: "L'entité a été ajoutée avec succès",
          });
          $('#NomEntite').val('')
          $('#RCEntite').val('')
          $('#ICEEntite').val('')
          $('#IdentifiantFiscal').val('')
          $('#TP').val('')
          $('#FormJrdq').val('')
          $('#Capital').val('')
          $('#Adresse').val('')
          $('#logoInpt').val('')
          getAllEntties();
        },
        error: function(error) {
          Toast.fire({
            icon: "error",
            title: "l'opération a échoué veuillez contacter l'administration",
          });
            console.error(error);
        }
    });

      } else {
        Toast.fire({
          icon: "error",
          title: "Veuillez remplir toutes les informations importantes",
        });
      }
    })

    getAllEntties()

})