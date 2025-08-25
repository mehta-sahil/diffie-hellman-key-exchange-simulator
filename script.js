let B, P, x, y, x1, y1, secretX, secretY;
let step = 0;
let maxSteps = 5;

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function() {
  // Mode selection
  const modeRadios = document.querySelectorAll('input[name="mode"]');
  modeRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      if (this.value === 'auto') {
        generateRandomValues();
      }
    });
  });

  // Start button
  document.getElementById('startBtn').addEventListener('click', initiate);
});

function generateRandomValues() {
  const primes = [5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53];
  P = primes[Math.floor(Math.random() * primes.length)];
  B = Math.floor(Math.random() * (P - 2)) + 2;
  
  document.getElementById('baseInput').value = B;
  document.getElementById('primeInput').value = P;
}

function initiate() {
  const mode = document.querySelector('input[name="mode"]:checked').value;
  
  if (mode === 'manual') {
    B = +document.getElementById('baseInput').value;
    P = +document.getElementById('primeInput').value;
  } else {
    generateRandomValues();
  }

  // Validate inputs
  if (B < 2 || P < 3) {
    alert('Base must be ≥ 2 and Prime must be ≥ 3');
    return;
  }

  // Generate random private keys
  x = Math.floor(Math.random() * (P - 2)) + 2;
  y = Math.floor(Math.random() * (P - 2)) + 2;
  
  // Calculate public values
  x1 = modPow(B, x, P);
  y1 = modPow(B, y, P);
  
  // Calculate shared secrets
  secretX = modPow(y1, x, P);
  secretY = modPow(x1, y, P);
  
  // Reset simulation
  step = 0;
  clearAllSteps();
  renderControls();
  render();
}

function modPow(base, exponent, modulus) {
  if (modulus === 1) return 0;
  
  let result = 1;
  base = base % modulus;
  
  while (exponent > 0) {
    if (exponent % 2 === 1) {
      result = (result * base) % modulus;
    }
    
    exponent = Math.floor(exponent / 2);
    base = (base * base) % modulus;
  }
  
  return result;
}

function renderControls() {
  const controls = document.getElementById('controls');
  controls.innerHTML = `
    <button id="prevBtn" onclick="prevStep()" ${step <= 0 ? 'disabled' : ''}>◀ Previous Step</button>
    <div class="step-indicator">Step ${step} of ${maxSteps}</div>
    <button id="nextBtn" onclick="nextStep()" ${step >= maxSteps ? 'disabled' : ''}>Next Step ▶</button>
  `;
}

function prevStep() {
  if (step > 0) {
    step--;
    render();
    renderControls();
  }
}

function nextStep() {
  if (step < maxSteps) {
    step++;
    render();
    renderControls();
  }
}

function clearAllSteps() {
  document.getElementById('stepsX').innerHTML = '';
  document.getElementById('stepsY').innerHTML = '';
  document.getElementById('attackerView').innerHTML = '';
  document.getElementById('x1Line').style.opacity = '0';
  document.getElementById('y1Line').style.opacity = '0';
}

function showStep(container, html, isSecret = false) {
  const el = document.createElement('div');
  el.className = 'step';
  if (isSecret) el.classList.add('secret');
  el.innerHTML = html;
  
  container.appendChild(el);
  setTimeout(() => el.classList.add('visible'), 50);
}

function render() {
  switch(step) {
    case 0:
      // Initial setup
      showStep(
        document.getElementById('attackerView'), 
        `Public parameters:<br>
        Base (B): <span class="value public-value">${B}</span><br>
        Prime (P): <span class="value public-value">${P}</span>`
      );
      break;
      
    case 1:
      // Private keys selection
      showStep(
        document.getElementById('stepsX'), 
        `Alice selects her private key:<br>
        <span class="value alice-value">x = ${x}</span>`
      );
      
      showStep(
        document.getElementById('stepsY'), 
        `Bob selects his private key:<br>
        <span class="value bob-value">y = ${y}</span>`
      );
      
      showStep(
        document.getElementById('attackerView'), 
        `Eve doesn't know the private keys selected by Alice and Bob`
      );
      break;
      
    case 2:
      // Public key calculation
      showStep(
        document.getElementById('stepsX'), 
        `Alice calculates her public value:<br>
        <span class="value alice-value">x₁ = B<sup>x</sup> mod P = ${B}<sup>${x}</sup> mod ${P} = ${x1}</span>`
      );
      
      showStep(
        document.getElementById('stepsY'), 
        `Bob calculates his public value:<br>
        <span class="value bob-value">y₁ = B<sup>y</sup> mod P = ${B}<sup>${y}</sup> mod ${P} = ${y1}</span>`
      );
      break;
      
    case 3:
      // Exchange public values
      showStep(
        document.getElementById('stepsX'), 
        `Alice sends her public value x₁ = <span class="value public-value">${x1}</span> to Bob`
      );
      
      showStep(
        document.getElementById('stepsY'), 
        `Bob sends his public value y₁ = <span class="value public-value">${y1}</span> to Alice`
      );
      
      showStep(
        document.getElementById('attackerView'), 
        `Eve intercepts the public values:<br>
        Alice's public value: <span class="value public-value">x₁ = ${x1}</span><br>
        Bob's public value: <span class="value public-value">y₁ = ${y1}</span><br>
        But Eve can't easily determine x or y from these values!`
      );
      

      break;
      
    case 4:
      // Alice calculates shared secret
      showStep(
        document.getElementById('stepsX'), 
        `Alice computes the shared secret:<br>
        <span class="value success-value">Secret = y₁<sup>x</sup> mod P = ${y1}<sup>${x}</sup> mod ${P} = ${secretX}</span>`,
        true
      );
      
      showStep(
        document.getElementById('attackerView'), 
        `Eve knows:<br>
        - Base (B): <span class="value public-value">${B}</span><br>
        - Prime (P): <span class="value public-value">${P}</span><br>
        - Alice's public value: <span class="value public-value">x₁ = ${x1}</span><br>
        - Bob's public value: <span class="value public-value">y₁ = ${y1}</span><br><br>
        Eve needs to solve the <span class="value fail-value">discrete logarithm problem</span> to find x or y, which is computationally difficult!`
      );
      break;
      
    case 5:
      // Bob calculates shared secret
      showStep(
        document.getElementById('stepsY'), 
        `Bob computes the shared secret:<br>
        <span class="value success-value">Secret = x₁<sup>y</sup> mod P = ${x1}<sup>${y}</sup> mod ${P} = ${secretY}</span>`,
        true
      );
      
      // Final verification
      if (secretX === secretY) {
        showStep(
          document.getElementById('attackerView'), 
          `<strong>The key exchange is successful!</strong><br>
          Both Alice and Bob now have the same shared secret: <span class="value success-value">${secretX}</span><br>
          Eve still cannot determine this value without solving the discrete logarithm problem.`
        );
      } else {
        showStep(
          document.getElementById('attackerView'), 
          `<strong>Error!</strong> Something went wrong. The secrets don't match:<br>
          Alice's secret: <span class="value alice-value">${secretX}</span><br>
          Bob's secret: <span class="value bob-value">${secretY}</span>`
        );
      }
      break;
  }
}
