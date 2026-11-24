/* Christian & Allie's wedding site: countdown + RSVP form. */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     RSVP settings
     RSVP_ENDPOINT is the web address the form sends answers to.
     It is not a password: it only accepts new RSVPs, it cannot read them.
     Leave it empty to show "RSVPs open soon" instead of sending anything.
     ------------------------------------------------------------------ */
  var RSVP_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzmWZP0WdBnsc3pLbzLk32Q5r017TybeiWiO61daLrGb7FdVwLBbis6NyOHNKTu4O0m/exec';

  /* ---------- Countdown under the hero buttons ---------- */
  var countdown = document.getElementById('countdown');
  if (countdown) {
    var campOpens = new Date(2027, 2, 26); // March 26, 2027 (months count from 0)
    var days = Math.ceil((campOpens - new Date()) / 86400000);
    if (days > 0) {
      countdown.textContent = days + (days === 1 ? ' day' : ' days') + ' until camp opens.';
    }
  }

  /* ---------- RSVP form ---------- */
  var form = document.getElementById('rsvp-form');
  if (!form) { return; }

  var sendBtn = document.getElementById('rsvp-send');
  var errorBox = document.getElementById('rsvp-error');
  var thanks = document.getElementById('thanks');
  var loadedAt = Date.now();

  function showError(message) {
    errorBox.textContent = message;
    errorBox.hidden = false;
  }

  function setBusy(busy) {
    sendBtn.disabled = busy;
    sendBtn.textContent = busy ? 'Sending…' : 'Send RSVP';
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    errorBox.hidden = true;

    var names = form.elements.names.value.trim();
    var partySize = parseInt(form.elements.party_size.value, 10);
    if (!names) {
      showError('Please add the name(s) of everyone in your party.');
      form.elements.names.focus();
      return;
    }
    if (!(partySize >= 1 && partySize <= 20)) {
      showError('Please enter how many people are in your party (1–20).');
      form.elements.party_size.focus();
      return;
    }
    if (!RSVP_ENDPOINT) {
      showError('RSVPs open soon. Please check back.');
      return;
    }

    var attending = form.elements.attending.value;
    var data = new URLSearchParams();
    data.set('names', names);
    data.set('attending', attending);
    data.set('party_size', String(partySize));
    data.set('shirt_sizes', form.elements.shirt_sizes.value.trim());
    data.set('dietary', form.elements.dietary.value.trim());
    data.set('sleeping_pad', form.elements.sleeping_pad.value);
    data.set('bedding_help', form.elements.bedding_help.value);
    // Spam checks: the hidden field must be empty, and people take more than a few seconds.
    data.set('website', form.elements.website.value);
    data.set('seconds_on_page', String(Math.round((Date.now() - loadedAt) / 1000)));

    setBusy(true);
    fetch(RSVP_ENDPOINT, { method: 'POST', body: data })
      .then(function (response) {
        if (!response.ok) { throw new Error('HTTP ' + response.status); }
        return response.json();
      })
      .then(function (result) {
        if (!result || result.ok !== true) { throw new Error('rejected'); }
        form.hidden = true;
        thanks.textContent = attending === 'Yes'
          ? 'Thanks, ' + names + '! Your RSVP is in. See you at camp.'
          : 'Thanks, ' + names + '. Your RSVP is in. We’ll miss you at camp.';
        thanks.hidden = false;
        thanks.focus();
      })
      .catch(function () {
        setBusy(false);
        showError('Sorry, that didn’t go through. Please try again in a minute, or let Christian or Allie know directly.');
      });
  });
})();
