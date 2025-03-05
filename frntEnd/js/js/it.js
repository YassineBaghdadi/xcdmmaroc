$(document).ready(function () {
  // fetch('/')
  //       .then(response => response.json())
  //       .then(data => {
  //           if (data.error) {
  //           console.error(data.error);
  //           } else {

  //       })
  //       .catch(error => {
  //           console.error('Error:', error);
  //       });

  var getDepsList = () => {
    $.get('/ERP/IT-Management/getDeprts', function (data) {
      $('#Departement').html(data.d);
      $('#UsersListe').html(data.u);
      // console.log(data);
    }).fail(function () {
      console.error('Failed to fetch default image.');
    });
  };

  getDepsList();

  var getSrvcs = () => {
    $('#srvcsTbl').html('');
    $('#srvcAttrDprtTbl').html('');
    if ($('#Departement').val()) {
      $.ajax({
        url: '/ERP/IT-Management/getSrvc',
        method: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify({ d: $('#Departement').val() }),
        success: function (response) {
          $('#srvcsTbl').html(response.a);
          $('#srvcAttrDprtTbl').html(response.b);
        },
        error: function (xhr, status, error) {
          console.error('Error creating data:', error);
        },
      });
    }
  };

  $('#Departement').on('change', () => {
    getSrvcs();
  });

  $('#attrSrvBtn').click(() => {
    var srvcs = [];
    $('.srvcs:checked').each(function () {
      srvcs.push($(this).attr('value'));
    });
    $.ajax({
      url: '/ERP/IT-Management/attrSrvc',
      method: 'POST',
      contentType: 'application/json',
      dataType: 'json',
      data: JSON.stringify({ d: $('#Departement').val(), s: srvcs }),
      success: function (response) {
        getSrvcs();
      },
      error: function (xhr, status, error) {
        console.error('Error creating data:', error);
      },
    });
  });

  $('#rmvAttrSrvBtn').click(() => {
    var srvcs = [];
    $('.attrSrv:checked').each(function () {
      srvcs.push($(this).attr('value'));
    });
    $.ajax({
      url: '/ERP/IT-Management/rmvAttrSrvBtn',
      method: 'POST',
      contentType: 'application/json',
      dataType: 'json',
      data: JSON.stringify({ d: $('#Departement').val(), s: srvcs }),
      success: function (response) {
        getSrvcs();
      },
      error: function (xhr, status, error) {
        console.error('Error creating data:', error);
      },
    });
  });

  $('#addDprtBtn').click(() => {
    if ($('#NewDep').val()) {
      $.ajax({
        url: '/ERP/IT-Management/addDprt',
        method: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify({ d: $('#NewDep').val() }),
        success: function (response) {
          getDepsList();
          $('#NewDep').val('');
        },
        error: function (xhr, status, error) {
          console.error('Error creating data:', error);
        },
      });
    }
  });

  $('#addSrvcBtn').click(() => {
    if ($('#Newservices').val()) {
      $.ajax({
        url: '/ERP/IT-Management/addSrvc',
        method: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify({ d: $('#Newservices').val() }),
        success: function (response) {
          getSrvcs();
          $('#Newservices').val('');
        },
        error: function (xhr, status, error) {
          console.error('Error creating data:', error);
        },
      });
    }
  });

  $('#UsersListe').on('change', async () => {
    if ($('#UsersListe').val()) {
      $(`.permsOps`).prop('checked', false);
      const response = await fetch(
        `/ERP/IT-Management/getPermitions?i=${$('#UsersListe').val()}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`
        );
      }

      const data = await response.json();
      console.log(data);

      data.forEach((e) => {
        $(`#${e}`).prop('checked', true);
      });

      $('#permisionsArea').removeAttr('hidden');
    } else {
      $('#permisionsArea').attr('hidden', true);
    }
  });

  $(document).on('change', 'input[type="checkbox"]', async function () {
    var ckd = 0;
    if (this.checked) {
      ckd = 1;
    }
    // $('#permisionsArea').attr('hidden', true);
    await fetch(
      `/IT-Management/addPermition?i=${this.id}&c=${ckd}&u=${$(
        '#UsersListe'
      ).val()}`
    );
    // $('#permisionsArea').removeAttr('hidden');
  });
});
