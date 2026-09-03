const times = document.querySelectorAll(".time");
const form = document.getElementById("form");
const done = document.getElementById("done");
let selected = "10:30";

document.querySelectorAll(".menu").forEach((menu) => {
  const nav = menu.closest(".nav");
  const links = nav?.querySelector(".links");
  if (!links) return;

  menu.setAttribute("aria-expanded", "false");
  menu.addEventListener("click", () => {
    const isOpen = links.classList.toggle("open");
    menu.setAttribute("aria-expanded", String(isOpen));
  });

  links.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      links.classList.remove("open");
      menu.setAttribute("aria-expanded", "false");
    });
  });
});

// -----------------------------
// HORARIOS
// -----------------------------
times.forEach((t) =>
  t.addEventListener("click", () => {
    times.forEach((x) => x.classList.remove("sel"));
    t.classList.add("sel");
    selected = t.textContent.trim();
  }),
);

// -----------------------------
// PERFIL DE MASCOTA
// -----------------------------
const profileForm = document.getElementById("petProfileForm");
const editPetBtn = document.getElementById("editPetBtn");
const saveMsg = document.getElementById("saveMsg");
const petList = document.getElementById("petList");
const addPetBtn = document.getElementById("addPetBtn");
const removePetBtn = document.getElementById("removePetBtn");
const defaultPetImage = document.getElementById("petImage")?.getAttribute("src") || "";
const requestedService = new URLSearchParams(window.location.search).get("servicio");

const defaultPet = {
  name: "",
  age: "3",
  type: "Perro",
  breed: "Golden Retriever",
  notes: "",
  image: "",
};

function getPets() {
  try {
    const savedPets = JSON.parse(localStorage.getItem("woofyPets"));
    if (Array.isArray(savedPets) && savedPets.length) return savedPets;

    const oldProfile = JSON.parse(localStorage.getItem("woofyPetProfile"));
    return [{ ...defaultPet, ...oldProfile, id: "pet-1" }];
  } catch {
    return [{ ...defaultPet, id: "pet-1" }];
  }
}

function savePets(pets) {
  localStorage.setItem("woofyPets", JSON.stringify(pets));
  localStorage.setItem("woofyPetProfile", JSON.stringify(pets[activePetIndex]));
}

let pets = getPets();
let activePetIndex = Number(localStorage.getItem("woofyActivePet")) || 0;
activePetIndex = Math.min(activePetIndex, pets.length - 1);

function showPetProfile() {
  const pet = pets[activePetIndex];

  const nameView = document.getElementById("petNameView");
  const ageView = document.getElementById("petAgeView");
  const weightView = document.getElementById("petWeightView");
  const typeView = document.getElementById("petTypeView");
  const breedView = document.getElementById("petBreedView");
  const image = document.getElementById("petImage");

  if (nameView) nameView.textContent = pet.name || "Indique nombre de mascota";
  if (ageView) ageView.textContent = pet.age ? `${pet.age} ${Number(pet.age) === 1 ? "año" : "años"}` : "Edad no indicada";
  if (weightView) weightView.textContent = pet.weight ? `${pet.weight} kg` : "Peso no indicado";
  if (typeView) typeView.textContent = pet.type || "Tipo no indicado";
  if (breedView) breedView.textContent = pet.breed || "Raza no indicada";
  const nextAppointmentView = document.getElementById("nextAppointmentView");
  if (nextAppointmentView) {
    try {
      const appointment = JSON.parse(localStorage.getItem("woofyNextAppointment"));
      if (appointment && appointment.pet === (pet.name || `Mascota ${activePetIndex + 1}`)) {
        nextAppointmentView.textContent = `${appointment.service} - ${appointment.date} a las ${appointment.time}`;
      }
    } catch {}
  }
  if (image) {
    image.alt = `Foto de ${pet.name || "mascota"}`;
    image.src = pet.image || defaultPetImage;
  }

  if (petList) {
    petList.innerHTML = pets.map((item, index) =>
      `<button class="pet-tab${index === activePetIndex ? " active" : ""}" type="button" data-pet-index="${index}">${item.name || `Mascota ${index + 1}`}</button>`,
    ).join("");
    petList.querySelectorAll(".pet-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        activePetIndex = Number(tab.dataset.petIndex);
        localStorage.setItem("woofyActivePet", activePetIndex);
        showPetProfile();
      });
    });
  }

  const petInput = document.getElementById("pet");
  if (petInput) {
    if (petInput.tagName === "SELECT") {
      petInput.innerHTML = pets.map((item, index) =>
        `<option value="${index}">${item.name || `Mascota ${index + 1}`}</option>`,
      ).join("") + `<option value="new">Paciente nuevo</option>`;
      const newPatient = new URLSearchParams(window.location.search).get("paciente") === "nuevo";
      petInput.value = newPatient ? "new" : String(activePetIndex);
      syncNewPatientField();
      petInput.addEventListener("change", () => {
        syncNewPatientField();
        if (petInput.value === "new") return;
        activePetIndex = Number(petInput.value);
        localStorage.setItem("woofyActivePet", activePetIndex);
        showPetProfile();
      }, { once: true });
    } else if (!petInput.value) {
      petInput.value = pet.name || "";
    }
  }

  if (profileForm) {
    document.getElementById("profileName").value = pet.name || "";
    document.getElementById("profileAge").value = pet.age || "";
    document.getElementById("profileWeight").value = pet.weight || "";
    document.getElementById("profileType").value = pet.type || "";
    document.getElementById("profileBreed").value = pet.breed || "";
    document.getElementById("profileNotes").value = pet.notes || "";
    document.getElementById("profilePhoto").value = "";
  }

  updateWhatsappLink();
}

function updateWhatsappLink() {
  const whatsappAppointment = document.getElementById("whatsappAppointment");
  const petInput = document.getElementById("pet");
  const serviceInput = document.getElementById("service");
  const dateInput = document.getElementById("date");
  const phoneInput = document.getElementById("phone");
  const notesInput = document.getElementById("appointmentNotes");
  if (!whatsappAppointment || !petInput || !serviceInput || !dateInput || !phoneInput) return;

  const selectedPet = petInput.tagName === "SELECT"
    ? petInput.value === "new"
      ? document.getElementById("newPetName")?.value.trim() || "Paciente nuevo"
      : pets[Number(petInput.value)]?.name || `Mascota ${Number(petInput.value) + 1}`
    : petInput.value.trim();
  const message = [
    "Hola POWSI, quiero confirmar una cita.",
    `Mascota: ${selectedPet}`,
    `Servicio: ${serviceInput.value}`,
    `Fecha: ${dateInput.value}`,
    `Hora: ${selected}`,
    `Contacto: ${phoneInput.value}`,
    ...(notesInput?.value.trim() ? [`Notas: ${notesInput.value.trim()}`] : []),
  ].join("\n");
  whatsappAppointment.href = `https://wa.me/59171764894?text=${encodeURIComponent(message)}`;
}

function syncNewPatientField() {
  const petInput = document.getElementById("pet");
  const newPatientField = document.getElementById("newPatientField");
  const newPetName = document.getElementById("newPetName");
  if (!petInput || !newPatientField || !newPetName) return;

  const isNewPatient = petInput.value === "new";
  newPatientField.hidden = !isNewPatient;
  newPetName.required = isNewPatient;
  if (isNewPatient) newPetName.focus();
}

const serviceInput = document.getElementById("service");
if (serviceInput && requestedService) {
  const matchingOption = [...serviceInput.options].find((option) => option.textContent === requestedService);
  if (matchingOption) serviceInput.value = matchingOption.value;
}

if (profileForm) {
  profileForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const profile = {
      ...pets[activePetIndex],
      name: document.getElementById("profileName").value.trim(),
      age: document.getElementById("profileAge").value.trim(),
      weight: document.getElementById("profileWeight").value.trim(),
      type: document.getElementById("profileType").value.trim(),
      breed: document.getElementById("profileBreed").value.trim(),
      notes: document.getElementById("profileNotes").value.trim(),
    };

    const photoInput = document.getElementById("profilePhoto");
    const photo = photoInput.files[0];
    const finishSave = (image) => {
      if (image) profile.image = image;
      pets[activePetIndex] = profile;
      savePets(pets);
      showPetProfile();
    };

    if (photo) {
      const reader = new FileReader();
      reader.addEventListener("load", () => finishSave(reader.result));
      reader.readAsDataURL(photo);
    } else {
      finishSave();
    }

    if (saveMsg) {
      saveMsg.textContent = "✓ Información guardada";
      setTimeout(() => (saveMsg.textContent = ""), 2500);
    }
  });
}

if (addPetBtn) {
  addPetBtn.addEventListener("click", () => {
    pets.push({ ...defaultPet, name: "", age: "", type: "", breed: "", id: `pet-${Date.now()}` });
    activePetIndex = pets.length - 1;
    localStorage.setItem("woofyActivePet", activePetIndex);
    savePets(pets);
    showPetProfile();
    document.getElementById("profileName")?.focus();
  });
}

if (removePetBtn) {
  removePetBtn.addEventListener("click", () => {
    if (pets.length === 1) {
      alert("Debes conservar al menos una mascota.");
      return;
    }

    const petName = pets[activePetIndex].name || `Mascota ${activePetIndex + 1}`;
    if (!confirm(`¿Eliminar a ${petName}? Esta acción no se puede deshacer.`)) return;

    pets.splice(activePetIndex, 1);
    activePetIndex = Math.min(activePetIndex, pets.length - 1);
    localStorage.setItem("woofyActivePet", activePetIndex);
    savePets(pets);
    showPetProfile();
  });
}

if (editPetBtn && profileForm) {
  editPetBtn.addEventListener("click", () => {
    profileForm.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => document.getElementById("profileName")?.focus(), 400);
  });
}

// -----------------------------
// AGENDAR CITA
// -----------------------------
if (form && done) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const petInput = document.getElementById("pet");
    const pet = petInput.tagName === "SELECT"
      ? petInput.value === "new"
        ? document.getElementById("newPetName").value.trim()
        : pets[Number(petInput.value)]?.name || `Mascota ${Number(petInput.value) + 1}`
      : petInput.value.trim();

    if (!pet) {
      petInput.focus();
      return;
    }

    document.getElementById("cPet").textContent = pet;
    document.getElementById("cService").textContent =
      document.getElementById("service").value;
    document.getElementById("cDate").textContent =
      document.getElementById("date").value;
    document.getElementById("cTime").textContent = selected;
    const notes = document.getElementById("appointmentNotes").value.trim();
    document.getElementById("cNotes").textContent = notes;
    document.getElementById("confirmationNotes").hidden = !notes;
    localStorage.setItem("woofyNextAppointment", JSON.stringify({
      pet,
      service: document.getElementById("service").value,
      date: document.getElementById("date").value,
      time: selected,
    }));
    updateWhatsappLink();

    done.classList.add("show");
    done.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
}

// -----------------------------
// IMÁGENES + PINTEREST
// IMPORTANTE: Pinterest suele dar enlaces a PINS, no URLs directas de imagen.
// En <img src=""> debe ir la URL directa de la imagen.
// En href="" puede ir el enlace del PIN.
// -----------------------------
document.querySelectorAll("[data-pinterest]").forEach((link) => {
  link.href = link.dataset.pinterest;
});

const pawPositions = [
  [8, 16], [78, 12], [30, 38], [91, 48], [12, 72], [63, 82],
];
document.querySelectorAll(".section").forEach((section, sectionIndex) => {
  pawPositions.forEach(([left, top], pawIndex) => {
    const paw = document.createElement("span");
    paw.className = "floating-paw";
    paw.textContent = "pets";
    paw.setAttribute("aria-hidden", "true");
    paw.style.left = `${(left + sectionIndex * 7 + pawIndex * 3) % 94}%`;
    paw.style.top = `${(top + sectionIndex * 11) % 88}%`;
    paw.style.animationDelay = `${-((sectionIndex + pawIndex) % 6)}s`;
    section.appendChild(paw);
  });
});

showPetProfile();
