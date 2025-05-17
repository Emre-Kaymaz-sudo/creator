// Kurs ve paket verilerini yükleme
let courses = [];
let packages = [];

// Sayfa yüklendiğinde verileri çek
document.addEventListener('DOMContentLoaded', async function() {
  try {
    const response = await fetch('data.json');
    const data = await response.json();
    
    courses = data.courses;
    packages = data.packages;
    
    // Paketleri göster
    renderPackages();
    
    // Builder modal'ını ayarla
    setupBuilderModal();
    
  } catch (error) {
    console.error('Veri yüklenirken hata oluştu:', error);
    showNotification('Veri yüklenemedi, lütfen sayfayı yenileyin.', 'error');
  }
});

// Paketleri görüntüle
function renderPackages() {
  const packageList = document.getElementById('package-list');
  packageList.innerHTML = '';
  
  packages.forEach(pkg => {
    // Pakette bulunan kursları toplama
    const packageCourses = pkg.courses.map(courseID => {
      return courses.find(course => course.courseID === courseID);
    });
    
    // Paket kategorilerini toplama
    const categories = [...new Set(packageCourses.map(course => course.category))];
    
    // Paket kartını oluşturma
    const packageCard = document.createElement('div');
    packageCard.className = 'bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100';
    
    // İndirim hesaplama
    const originalPrice = pkg.price;
    const discountedPrice = originalPrice * (1 - pkg.discount / 100);
    
    packageCard.innerHTML = `
      <div class="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white relative">
        <h3 class="text-xl font-bold mb-1">${pkg.name}</h3>
        <p class="text-sm text-blue-100 mb-4 line-clamp-2">${pkg.desc}</p>
        <div class="flex items-center justify-between">
          <div>
            <span class="text-2xl font-bold">$${discountedPrice.toFixed(2)}</span>
            ${pkg.discount > 0 ? `<span class="text-sm line-through ml-2 text-blue-200">$${originalPrice.toFixed(2)}</span>` : ''}
          </div>
          ${pkg.discount > 0 ? `<span class="bg-yellow-400 text-yellow-800 py-1 px-2 rounded-full text-xs font-bold">${pkg.discount}% Off</span>` : ''}
        </div>
      </div>
      <div class="p-6">
        <div class="flex flex-wrap gap-2 mb-4">
          ${categories.map(category => 
            `<span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">${category}</span>`
          ).join('')}
        </div>
        <p class="text-sm text-gray-600 mb-4">Contains ${packageCourses.length} Courses</p>
        <div class="expandable-content">
          <div class="pt-4 border-t border-gray-100">
            <h4 class="font-medium text-gray-900 mb-2">Courses in this package:</h4>
            <ul class="text-sm text-gray-600 space-y-1 list-disc pl-5">
              ${packageCourses.map(course => `<li>${course.name}</li>`).join('')}
            </ul>
          </div>
        </div>
        <div class="flex justify-between items-center mt-4">
          <button class="toggle-content text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
            <span class="show-text">Show Details</span>
            <span class="hide-text hidden">Hide Details</span>
            <i class="ti ti-chevron-down ml-1 toggle-icon"></i>
          </button>
          <button class="select-package-btn px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  data-package-id="${pkg.packageID}">
            Select Package
          </button>
        </div>
      </div>
    `;
    
    packageList.appendChild(packageCard);
    
    // Detayları göster/gizle düğmesi için işlevsellik
    const toggleButton = packageCard.querySelector('.toggle-content');
    toggleButton.addEventListener('click', function() {
      const card = this.closest('div.bg-white');
      card.classList.toggle('expanded');
      
      const showText = this.querySelector('.show-text');
      const hideText = this.querySelector('.hide-text');
      const toggleIcon = this.querySelector('.toggle-icon');
      
      if (card.classList.contains('expanded')) {
        showText.classList.add('hidden');
        hideText.classList.remove('hidden');
        toggleIcon.style.transform = 'rotate(180deg)';
      } else {
        showText.classList.remove('hidden');
        hideText.classList.add('hidden');
        toggleIcon.style.transform = 'rotate(0)';
      }
    });
    
    // Select Package düğmesi için işlevsellik
    const selectPackageButton = packageCard.querySelector('.select-package-btn');
    selectPackageButton.addEventListener('click', function() {
      const packageId = this.getAttribute('data-package-id');
      selectPackage(packageId);
    });
  });
}

// Paket seçme fonksiyonu
function selectPackage(packageId) {
  // Seçilen paketi bul
  const selectedPackage = packages.find(pkg => pkg.packageID === packageId);
  
  if (!selectedPackage) {
    showNotification('Package not found.', 'error');
    return;
  }
  
  // Modal'ı aç
  openModal();
  
  // Modal açıldıktan sonra kurumları işaretle
  setTimeout(() => {
    // Tüm checkbox'ları temizle
    document.querySelectorAll('#custom-grid input[type="checkbox"]').forEach(checkbox => {
      checkbox.checked = false;
    });
    
    // Paketteki kursları seç
    selectedPackage.courses.forEach(courseId => {
      const checkbox = document.querySelector(`#custom-grid input[data-course-id="${courseId}"]`);
      if (checkbox) {
        checkbox.checked = true;
      }
    });
    
    // Checkbox durumlarını güncelle
    updateCheckboxStates();
    
    // Success mesajı
    showNotification(`"${selectedPackage.name}" package has been loaded. You can customize it further.`, 'success');
  }, 300); // Modal açılma animasyonu için kısa bir gecikme
}

// Özel paket oluşturucuyu ayarlama
function setupBuilderModal() {
  // Modal açma/kapama işlevselliği
  const modal = document.getElementById('package-builder-modal');
  const openModalButtons = [
    document.getElementById('toggle-builder'),
    document.getElementById('header-toggle-builder')
  ];
  const closeModalButton = document.getElementById('close-modal');
  
  openModalButtons.forEach(btn => {
    if (btn) btn.addEventListener('click', openModal);
  });
  
  if (closeModalButton) {
    closeModalButton.addEventListener('click', closeModal);
  }
  
  // Kategori filtrelerini ayarlama
  setupCategoryFilters();
  
  // Arama fonksiyonunu ayarla
  setupSearch();
  
  // Kurs listesini oluştur
  renderCourseList();
}

// Modal'ı aç
function openModal() {
  const modal = document.getElementById('package-builder-modal');
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

// Modal'ı kapat
function closeModal() {
  const modal = document.getElementById('package-builder-modal');
  modal.classList.remove('active');
  document.body.style.overflow = 'auto';
  
  // Seçimleri sıfırla
  document.querySelectorAll('#custom-grid input[type="checkbox"]').forEach(checkbox => {
    checkbox.checked = false;
  });
  
  // Arama kutusunu sıfırla
  const searchInput = document.getElementById('course-search');
  if (searchInput) {
    searchInput.value = '';
  }
  
  // Özet kısmını gizle
  document.getElementById('selected-courses-summary').classList.add('hidden');
  
  // Kategori filtresini sıfırla
  document.querySelectorAll('.category-pill').forEach(pill => {
    pill.classList.remove('active');
  });
  document.querySelector('.category-pill[data-category="all"]').classList.add('active');
  
  // Kursları yeniden yükle
  renderCourseList();
}

// Kategori filtrelerini ayarlama
function setupCategoryFilters() {
  const categoryFiltersContainer = document.getElementById('category-filters');
  
  // Tüm kategorileri topla
  const categories = [...new Set(courses.map(course => course.category))];
  
  // "Tüm Kurslar" zaten HTML'de var, sadece kategorileri ekle
  categories.forEach(category => {
    const pill = document.createElement('button');
    pill.className = 'category-pill px-4 py-2 rounded-full text-sm font-medium bg-gray-100 hover:bg-gray-200 transition';
    pill.setAttribute('data-category', category);
    pill.textContent = category;
    
    pill.addEventListener('click', () => {
      // Aktif kategoriyi güncelle
      document.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      
      // Kursları filtrele
      filterCoursesByCategory(category);
    });
    
    categoryFiltersContainer.appendChild(pill);
  });
}

// Kurs listesini göster
function renderCourseList() {
  const customGrid = document.getElementById('custom-grid');
  customGrid.innerHTML = '';
  
  // Tüm kursları göster
  courses.forEach(course => {
    customGrid.appendChild(createCourseCard(course));
  });
  
  // Checkbox'ları ayarla
  setupCheckboxes();
}

// Belirli bir kategoriye göre kursları filtrele
function filterCoursesByCategory(category) {
  const customGrid = document.getElementById('custom-grid');
  customGrid.innerHTML = '';
  
  let filteredCourses;
  
  if (category === 'all') {
    filteredCourses = courses;
  } else {
    filteredCourses = courses.filter(course => course.category === category);
  }
  
  filteredCourses.forEach(course => {
    customGrid.appendChild(createCourseCard(course));
  });
  
  // Checkbox'ları yeniden ayarla
  setupCheckboxes();
}

// Kurs kartı oluştur
function createCourseCard(course) {
  const card = document.createElement('div');
  card.className = 'bg-white rounded-lg shadow p-4 border border-gray-100 relative';
  
  // Kurs etiketlerini oluştur
  const labels = course.labels.map(label => 
    `<span class="px-2 py-1 text-xs rounded-full text-white bg-${label.color}-500">${label.label}</span>`
  ).join('');
  
  // Önkoşulları kontrol et
  const hasPrereqs = course.preqs && course.preqs.length > 0;
  const prereqsList = hasPrereqs ? course.preqs.map(prereqID => {
    const prereqCourse = courses.find(c => c.courseID === prereqID);
    return prereqCourse ? prereqCourse.name : prereqID;
  }).join(', ') : 'None';
  
  card.innerHTML = `
    <h3 class="font-medium text-gray-900 mb-1">${course.name}</h3>
    <p class="text-xs text-gray-500 mb-2">${course.courseID}</p>
    <p class="text-sm text-gray-600 mb-3">${course.desc}</p>
    
    <div class="flex flex-wrap gap-2 mb-3">
      ${labels}
    </div>
    
    <div class="text-sm text-gray-600 mb-2">
      <span class="font-medium">Category:</span> ${course.category}
    </div>
    
    <div class="text-sm text-gray-600 mb-3">
      <span class="font-medium">Prerequisites:</span> ${prereqsList}
    </div>
    
    <div class="flex justify-between items-center">
      <span class="text-blue-600 font-bold">$${course.priceIndependent.toFixed(2)}</span>
      <div class="flex items-center">
        <input type="checkbox" id="course-${course.courseID}" data-course-id="${course.courseID}" 
               class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 mr-2">
        <label for="course-${course.courseID}" class="text-sm text-gray-700">Add to Package</label>
      </div>
    </div>
  `;
  
  return card;
}

// Checkbox'ları ayarla
function setupCheckboxes() {
  const checkboxes = document.querySelectorAll('#custom-grid input[type="checkbox"]');
  const finishButton = document.getElementById('finish-btn');
  
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      updateCheckboxStates();
      updateFinishButtonState();
    });
  });
  
  // Finish button state update
  function updateFinishButtonState() {
    const anyChecked = [...checkboxes].some(cb => cb.checked);
    finishButton.disabled = !anyChecked;
    
    if (anyChecked) {
      const checkedCount = [...checkboxes].filter(cb => cb.checked).length;
      finishButton.textContent = `Finish & Save Package (${checkedCount} selected)`;
    } else {
      finishButton.textContent = 'Finish & Save Package';
    }
  }
  
  // Finish button
  finishButton.addEventListener('click', () => {
    const selectedCourseIDs = [...checkboxes]
      .filter(cb => cb.checked)
      .map(cb => cb.getAttribute('data-course-id'));
    
    // Seçilen kursları işle (örn. kaydet veya göster)
    const selectedCourses = courses.filter(course => selectedCourseIDs.includes(course.courseID));
    
    // Toplam fiyatı hesapla
    let totalPrice = selectedCourses.reduce((sum, course) => sum + course.priceIndependent, 0);
    
    // Temel indirim - örnek olarak %15
    const discountPercent = 15;
    const discountedPrice = totalPrice * (1 - discountPercent / 100);
    const savedAmount = totalPrice - discountedPrice;
    
    // Bildirim göster - şimdi hem orijinal fiyat hem de indirimli fiyat ile
    showNotification(
      `Custom package created with ${selectedCourses.length} courses.<br>
      <div class="flex flex-col mt-2">
        <div class="flex justify-between">
          <span>Original Price:</span>
          <span>$${totalPrice.toFixed(2)}</span>
        </div>
        <div class="flex justify-between text-green-700">
          <span>Discount (${discountPercent}%):</span>
          <span>-$${savedAmount.toFixed(2)}</span>
        </div>
        <div class="flex justify-between font-bold mt-1 pt-1 border-t border-gray-200">
          <span>Total:</span>
          <span>$${discountedPrice.toFixed(2)}</span>
        </div>
      </div>`,
      'success'
    );
    
    // Modal'ı kapat
    closeModal();
  });
  
  // Initial update
  updateCheckboxStates();
}

// Checkbox durumlarını güncelle (önkoşul kontrolü)
function updateCheckboxStates() {
  const checkboxes = document.querySelectorAll('#custom-grid input[type="checkbox"]');
  const selectedCourseIDs = [...checkboxes]
    .filter(cb => cb.checked)
    .map(cb => cb.getAttribute('data-course-id'));
  
  // Seçilen kursların listesini güncelle
  const selectedCoursesDiv = document.getElementById('selected-courses-summary');
  const selectedCoursesList = document.getElementById('selected-courses-list');
  
  if (selectedCourseIDs.length > 0) {
    selectedCoursesDiv.classList.remove('hidden');
    
    // Seçilen kursları göster
    selectedCoursesList.innerHTML = '';
    const selectedCourses = courses.filter(course => selectedCourseIDs.includes(course.courseID));
    
    // Toplam fiyatı hesapla
    let totalPrice = selectedCourses.reduce((sum, course) => sum + course.priceIndependent, 0);
    
    // Temel indirim - örnek olarak %15
    const discountPercent = 15;
    const discountedPrice = totalPrice * (1 - discountPercent / 100);
    
    selectedCourses.forEach(course => {
      const li = document.createElement('li');
      li.className = 'flex justify-between items-center py-1';
      li.innerHTML = `
        <span>${course.name}</span>
        <span class="text-blue-600 font-medium">$${course.priceIndependent.toFixed(2)}</span>
      `;
      selectedCoursesList.appendChild(li);
    });
    
    // Toplam fiyat bilgisini ekle
    const totalLi = document.createElement('li');
    totalLi.className = 'flex justify-between items-center pt-3 mt-2 border-t border-gray-200 font-bold';
    totalLi.innerHTML = `
      <span>Subtotal:</span>
      <span class="text-blue-600">$${totalPrice.toFixed(2)}</span>
    `;
    selectedCoursesList.appendChild(totalLi);
    
    // İndirimli fiyat bilgisini ekle
    const discountLi = document.createElement('li');
    discountLi.className = 'flex justify-between items-center py-1 text-green-600';
    discountLi.innerHTML = `
      <span>Discount (${discountPercent}%):</span>
      <span>-$${(totalPrice - discountedPrice).toFixed(2)}</span>
    `;
    selectedCoursesList.appendChild(discountLi);
    
    // Toplam indirimli fiyat
    const finalLi = document.createElement('li');
    finalLi.className = 'flex justify-between items-center pt-2 mt-2 border-t border-gray-200 font-bold text-lg';
    finalLi.innerHTML = `
      <span>Total:</span>
      <span class="text-blue-600">$${discountedPrice.toFixed(2)}</span>
    `;
    selectedCoursesList.appendChild(finalLi);
    
  } else {
    selectedCoursesDiv.classList.add('hidden');
  }
  
  // Önkoşul kontrolü
  checkboxes.forEach(checkbox => {
    const courseID = checkbox.getAttribute('data-course-id');
    const course = courses.find(c => c.courseID === courseID);
    const cardElement = checkbox.closest('div.bg-white');
    
    // Remove any existing lock icons
    const existingLockIcon = cardElement.querySelector('.lock-icon');
    if (existingLockIcon) {
      existingLockIcon.remove();
    }
    
    // Remove locked status
    cardElement.classList.remove('course-locked');
    checkbox.disabled = false;
    
    // Check if course has prerequisites
    if (course && course.preqs && course.preqs.length > 0) {
      const prereqsMet = course.preqs.every(prereq => selectedCourseIDs.includes(prereq));
      
      // If not selected and prerequisites not met, disable
      if (!checkbox.checked && !prereqsMet) {
        checkbox.disabled = true;
        cardElement.classList.add('course-locked');
        
        // Add lock icon
        const lockIcon = document.createElement('i');
        lockIcon.className = 'ti ti-lock lock-icon';
        cardElement.appendChild(lockIcon);
        
        // Add tooltip to show required prerequisites
        const requiredPrereqs = course.preqs.map(prereqID => {
          const prereqCourse = courses.find(c => c.courseID === prereqID);
          return prereqCourse ? prereqCourse.name : prereqID;
        }).join(', ');
        
        cardElement.setAttribute('title', `Prerequisites required: ${requiredPrereqs}`);
      } else {
        cardElement.removeAttribute('title');
      }
    }
  });
}

// Bildirim gösterme fonksiyonu
function showNotification(message, type = 'success') {
  // Var olan bildirimleri kaldır
  const existingNotifications = document.querySelectorAll('.notification');
  existingNotifications.forEach(notif => notif.remove());
  
  // Yeni bildirim oluştur
  const notification = document.createElement('div');
  notification.className = `notification fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-500 ${
    type === 'success' ? 'bg-green-100 text-green-800 border-l-4 border-green-500' : 
    'bg-red-100 text-red-800 border-l-4 border-red-500'
  } opacity-0`;
  
  // İçeriği HTML olarak ayarla
  notification.innerHTML = `
    <div class="flex items-start">
      <i class="ti ${type === 'success' ? 'ti-circle-check' : 'ti-alert-circle'} mr-3 mt-1"></i>
      <div>${message}</div>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Genişlik ayarı
  notification.style.maxWidth = '400px';
  
  // Animasyon ekle
  setTimeout(() => {
    notification.classList.remove('opacity-0');
  }, 10);
  
  // Belirli bir süre sonra bildirim kaybolsun
  setTimeout(() => {
    notification.classList.add('opacity-0');
    setTimeout(() => notification.remove(), 8000);
  }, 8000);
}

// Arama işlevini ayarlama
function setupSearch() {
  const searchInput = document.getElementById('course-search');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      const searchTerm = this.value.toLowerCase().trim();
      
      // Aktif kategoriyi al
      const activeCategory = document.querySelector('.category-pill.active');
      const category = activeCategory ? activeCategory.getAttribute('data-category') : 'all';
      
      // Arama ve kategori filtresini birlikte uygula
      searchAndFilterCourses(searchTerm, category);
    });
  }
}

// Arama ve kategori filtresini birlikte uygulama
function searchAndFilterCourses(searchTerm, category) {
  const customGrid = document.getElementById('custom-grid');
  customGrid.innerHTML = '';
  
  let filteredCourses;
  
  // Önce kategoriye göre filtrele
  if (category === 'all') {
    filteredCourses = courses;
  } else {
    filteredCourses = courses.filter(course => course.category === category);
  }
  
  // Sonra arama terimine göre filtrele
  if (searchTerm) {
    filteredCourses = filteredCourses.filter(course => {
      return course.name.toLowerCase().includes(searchTerm) || 
             course.courseID.toLowerCase().includes(searchTerm) ||
             course.desc.toLowerCase().includes(searchTerm);
    });
  }
  
  // Filtrelenmiş kursları göster
  filteredCourses.forEach(course => {
    customGrid.appendChild(createCourseCard(course));
  });
  
  // Checkbox'ları yeniden ayarla
  setupCheckboxes();
}

// Belirli bir kategoriye göre kursları filtrele
function filterCoursesByCategory(category) {
  // Arama kutusundaki metni al
  const searchInput = document.getElementById('course-search');
  const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
  
  // Arama ve kategori filtresini birlikte uygula
  searchAndFilterCourses(searchTerm, category);
}
