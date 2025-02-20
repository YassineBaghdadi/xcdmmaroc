(function($) {
  'use strict';
  $(function() {
    var todoListItem = $('.todo-etape');
    var todoListInput = $('.todo-etape-input');
    $('.todo-etape-add-btn').on("click", function(event) {
      event.preventDefault();

      var item = $(this).prevAll('.todo-etape-input').val();

      if (item) {
        todoListItem.append("<li><div class='form-check'><label class='form-check-label'><input class='checkbox' type='checkbox'/>" + item + "<i class='input-helper'></i></label><div class='btn-group' role='group' aria-label='Basic example'><button type='button' class='btn btn-primary btn-sm'><i class='mdi mdi-account-multiple-plus'></i></button><button type='button' class='btn btn-primary btn-sm'><i class='mdi mdi-note-plus'></i></button><button type='button' class='btn btn-primary btn-sm'><i class='mdi mdi-timetable'></i></button><button type='button' class='btn btn-info btn-sm'><i class='mdi mdi-history'></i> </button><select class='form-control btn btn-google btn-sm' id='StatutTODO' name='StatutTODO'><option>New</option><option>encours</option></select></div></div><i class='remove ti-close'></i></li>");
        todoListInput.val("");
      }

    });

    todoListItem.on('change', '.checkbox', function() {
      if ($(this).attr('checked')) {
        $(this).removeAttr('checked');
      } else {
        $(this).attr('checked', 'checked');
      }

      $(this).closest("li").toggleClass('completed');

    });

    todoListItem.on('click', '.remove', function() {
      $(this).parent().remove();
    });

  });
})(jQuery);