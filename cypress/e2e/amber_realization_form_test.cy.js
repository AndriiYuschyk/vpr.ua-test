describe('Тестування форми "ЗАЯВКА" - Реалізація бурштину', () => {
  // Генератори тестових даних
  const generateRandomData = () => {
    const names = [
      'ТОВ "Тест-Бурштин-Плюс"',
      'ПП "Тест-Янтар-Трейд"',
      'ООО "Тест-Амбер-Експорт"',
      'ТОВ "Тест Золотий Камінь"',
    ];
    const edrpouCodes = ['11111111', '88888888', '77777777', '55555555'];
    const fullNames = [
      'Іваненко Іван Іванович',
      'Петренко Петро Петрович',
      'Сидоренко Сидір Сидорович',
      'Коваленко Олександр Михайлович',
    ];
    const positions = ['Директор', 'Менеджер з продажу', 'Керівник відділу', 'Комерційний директор'];
    const phones = ['+380501234567', '+380671234567', '+380631234567', '+380991234567'];

    const randomIndex = Math.floor(Math.random() * names.length);
    const randomWeight = Math.floor(Math.random() * 50) + 1;

    return {
      name: names[randomIndex],
      edrpou: edrpouCodes[randomIndex],
      fullName: fullNames[randomIndex],
      position: positions[randomIndex],
      email: 'amber@test.com',
      phone: phones[randomIndex],
      weight: randomWeight.toString(),
      message:
        'Не реагуйте на цей лист!!! Це тестове повідомлення призначається лише для перевірки роботи відправки форми!!!',
    };
  };

  // Виправлена функція для вибору рандомного значення з select з візуальним оновленням
  const selectRandomOptionWithWait = selector => {
    // Очікуємо поки select з'явиться та буде мати опції
    cy.get(selector).should('exist');

    // Очікуємо поки опції завантажяться (крім порожніх)
    cy.get(`${selector} option`).should('have.length.greaterThan', 1);

    cy.get(selector).then($select => {
      const options = $select.find('option').not('[value=""], [value="0"], [value="_none"]').not(':disabled');

      if (options.length > 0) {
        const randomIndex = Math.floor(Math.random() * options.length);
        const randomValue = options.eq(randomIndex).val();
        const randomText = options.eq(randomIndex).text().trim();

        // Фокусуємося на select для активації (замість click)
        cy.get(selector).focus({ force: true });

        // Встановлюємо значення
        cy.get(selector).select(randomValue, { force: true });

        // Тригеримо події для оновлення візуального відображення
        cy.get(selector).trigger('change', { force: true });
        cy.get(selector).trigger('input', { force: true });
        cy.get(selector).trigger('blur', { force: true });

        // Додаткові події для Drupal
        cy.get(selector).trigger('drupal:updated', { force: true });

        // Тригеримо події через JavaScript для надійності
        cy.get(selector).then($el => {
          $el[0].dispatchEvent(new Event('change', { bubbles: true }));
          $el[0].dispatchEvent(new Event('input', { bubbles: true }));

          // Спеціальні події для популярних бібліотек
          $el.trigger('chosen:updated'); // Chosen.js
          $el.trigger('select2:select'); // Select2
        });

        // Пауза для оновлення UI
        cy.wait(200);

        // Верифікація що значення встановилось
        cy.get(selector).should('have.value', randomValue);

        // Додаткова перевірка що обрана опція відображається
        cy.get(selector).find('option:selected').should('have.value', randomValue);
        cy.get(selector).find('option:selected').should('contain.text', randomText);

        cy.log(`Selected "${randomText}" (${randomValue}) for ${selector}`);
      } else {
        cy.log(`No valid options available in ${selector}`);
      }
    });
  };

  // Оновлена функція заповнення форми
  const fillForm = (data, skipFields = []) => {
    if (!skipFields.includes('name')) {
      cy.get('#edit-name').clear().type(data.name);
    }
    if (!skipFields.includes('edrpou')) {
      cy.get('#edit-kod-yedrpou').clear().type(data.edrpou);
    }
    if (!skipFields.includes('fullName')) {
      cy.get('#edit-pib').clear().type(data.fullName);
    }
    if (!skipFields.includes('position')) {
      cy.get('#edit-posada').clear().type(data.position);
    }
    if (!skipFields.includes('email')) {
      cy.get('#edit-email').clear().type(data.email);
    }
    if (!skipFields.includes('phone')) {
      cy.get('#edit-kontaktnyy-nomer-telefonu').clear().type(data.phone);
    }

    // Рандомний вибір опцій у select-ах з візуальним оновленням
    if (!skipFields.includes('massFraction')) {
      selectRandomOptionWithWait('select[name="masova_fraktsiya_burshtynu"]');
    }
    if (!skipFields.includes('group')) {
      selectRandomOptionWithWait('select[name="452"]');
    }

    if (!skipFields.includes('weight')) {
      cy.get('#edit-bazhana-vaha-burshtynu').clear().type(data.weight);
    }
    if (!skipFields.includes('message')) {
      cy.get('#edit-message').clear().type(data.message);
    }
  };

  beforeEach(() => {
    cy.visit('/amber-realization');

    // Очікуємо повного завантаження сторінки
    cy.get('body').should('be.visible');

    // Очікуємо що основні елементи форми завантажилися
    cy.get('#edit-name').should('be.visible');
    cy.get('select[name="masova_fraktsiya_burshtynu"]').should('be.visible');
    cy.get('select[name="452"]').should('be.visible');

    // Додаткова пауза для завантаження динамічного контенту
    cy.wait(1000);
  });

  describe('Позитивні тести', () => {
    it('Успішне заповнення всіх полів форми з валідними даними', () => {
      const testData = generateRandomData();

      // Спочатку перевіряємо що select-и існують та мають опції
      cy.get('select[name="masova_fraktsiya_burshtynu"]').should('exist');
      cy.get('select[name="452"]').should('exist');

      // Очікуємо що опції завантажилися
      cy.get('select[name="masova_fraktsiya_burshtynu"] option').should('have.length.greaterThan', 1);
      cy.get('select[name="452"] option').should('have.length.greaterThan', 1);

      fillForm(testData);

      // Перевірка, що всі поля заповнені
      cy.get('#edit-name').should('have.value', testData.name);
      cy.get('#edit-kod-yedrpou').should('have.value', testData.edrpou);
      cy.get('#edit-pib').should('have.value', testData.fullName);
      cy.get('#edit-posada').should('have.value', testData.position);
      cy.get('#edit-email').should('have.value', testData.email);
      cy.get('select[name="masova_fraktsiya_burshtynu"]')
        .should('not.have.value', '')
        .and('not.have.value', '0')
        .and('not.have.value', '_none')
        .then($select => {
          const selectedValue = $select.val();
          const selectedText = $select.find('option:selected').text().trim();
          cy.log(`Selected masova_fraktsiya_burshtynu: "${selectedText}" (${selectedValue})`);

          // Перевіряємо що опція дійсно обрана візуально
          cy.get('select[name="masova_fraktsiya_burshtynu"] option:selected')
            .should('have.value', selectedValue)
            .and('not.have.value', '')
            .and('not.have.value', '0');
        });
      cy.get('select[name="452"]')
        .should('not.have.value', '')
        .and('not.have.value', '0')
        .and('not.have.value', '_none')
        .then($select => {
          const selectedValue = $select.val();
          const selectedText = $select.find('option:selected').text().trim();
          cy.log(`Selected group 452: "${selectedText}" (${selectedValue})`);

          // Перевіряємо що опція дійсно обрана візуально
          cy.get('select[name="452"] option:selected')
            .should('have.value', selectedValue)
            .and('not.have.value', '')
            .and('not.have.value', '0');
        });
      cy.get('#edit-kontaktnyy-nomer-telefonu').should('have.value', testData.phone);
      cy.get('#edit-bazhana-vaha-burshtynu').should('have.value', testData.weight);
      cy.get('#edit-message').should('have.value', testData.message);
    });

    it("Заповнення форми з мінімальними обов'язковими даними", () => {
      const testData = generateRandomData();

      // Припустимо, що обов'язкові поля: name, email, phone
      cy.get('#edit-name').type(testData.name);
      cy.get('#edit-email').type(testData.email);
      cy.get('#edit-kontaktnyy-nomer-telefonu').type(testData.phone);

      cy.get('#edit-name').should('have.value', testData.name);
      cy.get('#edit-email').should('have.value', testData.email);
      cy.get('#edit-kontaktnyy-nomer-telefonu').should('have.value', testData.phone);
    });

    it('Тестування різних форматів телефону', () => {
      const testData = generateRandomData();
      const phoneFormats = ['+380501234567', '0501234567', '380501234567'];

      phoneFormats.forEach((phone, index) => {
        cy.get('#edit-kontaktnyy-nomer-telefonu').clear().type(phone);
        cy.get('#edit-kontaktnyy-nomer-telefonu').should('have.value', phone);
      });
    });

    it('Тестування вибору різних опцій у select-ах з візуальною перевіркою', () => {
      // Тестуємо що можемо вибрати різні опції
      cy.get('select[name="masova_fraktsiya_burshtynu"] option').should('have.length.greaterThan', 1);
      cy.get('select[name="452"] option').should('have.length.greaterThan', 1);

      // Вибираємо кілька разів різні опції та перевіряємо візуальні зміни
      for (let i = 0; i < 3; i++) {
        cy.log(`=== Iteration ${i + 1} ===`);

        selectRandomOptionWithWait('select[name="masova_fraktsiya_burshtynu"]');
        selectRandomOptionWithWait('select[name="452"]');

        // Перевіряємо що значення дійсно змінилися
        cy.get('select[name="masova_fraktsiya_burshtynu"]').then($select => {
          const value = $select.val();
          const text = $select.find('option:selected').text().trim();
          cy.log(`Iteration ${i + 1} - Mass fraction: "${text}" (${value})`);
          expect(value).to.not.be.oneOf(['', '0', '_none']);
        });

        cy.get('select[name="452"]').then($select => {
          const value = $select.val();
          const text = $select.find('option:selected').text().trim();
          cy.log(`Iteration ${i + 1} - Group: "${text}" (${value})`);
          expect(value).to.not.be.oneOf(['', '0', '_none']);
        });

        cy.wait(500); // Невелика пауза між вибором
      }
    });
  });

  describe('Негативні тести', () => {
    it("Відправка форми з порожніми обов'язковими полями", () => {
      // Спробуємо відправити форму без заповнення
      // cy.get('#edit-actions-submit').click();

      // Перевірка наявності помилок валідації
      cy.get('.messages--error, .error, .form-item--error-message').should('exist');
    });

    it('Некоректний формат email', () => {
      const testData = generateRandomData();
      const invalidEmails = ['invalid-email', 'test@', '@example.com', 'test.example.com'];

      fillForm(testData, ['email']);

      invalidEmails.forEach(email => {
        cy.get('#edit-email').clear().type(email);
        // cy.get('#edit-actions-submit').click();

        // Перевірка помилки валідації email
        cy.get('.messages--error, .error, [data-drupal-selector="edit-email"] + .form-item--error-message').should(
          'exist',
        );
      });
    });

    it('Некоректний код ЄДРПОУ', () => {
      const testData = generateRandomData();
      const invalidEdrpou = ['123', '12345678901', 'abcdefgh', ''];

      fillForm(testData, ['edrpou']);

      invalidEdrpou.forEach(code => {
        cy.get('#edit-kod-yedrpou').clear();
        if (code) cy.get('#edit-kod-yedrpou').type(code);

        // cy.get('#edit-actions-submit').click();

        // Перевірка помилки валідації
        cy.get('.messages--error, .error').should('exist');
      });
    });

    it('Некоректний номер телефону', () => {
      const testData = generateRandomData();
      const invalidPhones = ['123', '12345', 'abcdefghijk', '+380123'];

      fillForm(testData, ['phone']);

      invalidPhones.forEach(phone => {
        cy.get('#edit-kontaktnyy-nomer-telefonu').clear().type(phone);
        // cy.get('#edit-actions-submit').click();

        // Перевірка помилки валідації
        cy.get('.messages--error, .error').should('exist');
      });
    });

    it('Негативне значення ваги бурштину', () => {
      const testData = generateRandomData();
      fillForm(testData, ['weight']);

      cy.get('#edit-bazhana-vaha-burshtynu').clear().type('-5');
      // cy.get('#edit-actions-submit').click();

      // Перевірка помилки валідації
      cy.get('.messages--error, .error').should('exist');
    });

    it('Занадто довгий текст у полях', () => {
      const longText = 'А'.repeat(1000); // 1000 символів
      const testData = generateRandomData();

      fillForm(testData);

      cy.get('#edit-message').clear().type(longText);
      // cy.get('#edit-actions-submit').click();

      // Перевірка обмеження довжини
      cy.get('.messages--error, .error').should('exist');
    });
  });

  describe('Тести інтерфейсу', () => {
    it('Перевірка наявності всіх полів форми', () => {
      cy.get('#edit-name').should('be.visible');
      cy.get('#edit-kod-yedrpou').should('be.visible');
      cy.get('#edit-pib').should('be.visible');
      cy.get('#edit-posada').should('be.visible');
      cy.get('#edit-email').should('be.visible');
      cy.get('#edit-kontaktnyy-nomer-telefonu').should('be.visible');
      cy.get('select[name="masova_fraktsiya_burshtynu"]').should('be.visible');
      cy.get('select[name="452"]').should('be.visible');
      cy.get('#edit-bazhana-vaha-burshtynu').should('be.visible');
      cy.get('#edit-message').should('be.visible');
      // cy.get('#edit-actions-submit').should('be.visible');
    });

    it('Перевірка опцій у select-ах', () => {
      cy.get('select[name="masova_fraktsiya_burshtynu"] option').should('have.length.greaterThan', 1);
      cy.get('select[name="452"] option').should('have.length.greaterThan', 1);

      cy.get('select[name="masova_fraktsiya_burshtynu"]').then($select => {
        const validOptions = $select.find('option').not('[value=""], [value="0"], [value="_none"]');
        expect(validOptions.length).to.be.greaterThan(0);
      });

      cy.get('select[name="452"]').then($select => {
        const validOptions = $select.find('option').not('[value=""], [value="0"], [value="_none"]');
        expect(validOptions.length).to.be.greaterThan(0);
      });
    });

    it('Перевірка placeholder-ів та label-ів', () => {
      cy.get('label[for="edit-name"]').should('exist');
      cy.get('label[for="edit-email"]').should('exist');
      cy.get('label[for="edit-kontaktnyy-nomer-telefonu"]').should('exist');
    });
  });

  /*
    describe('Тест відправки форми (ПРОДУКЦІЯ)', () => {
        it('Успішна відправка валідної форми', () => {
            const testData = generateRandomData();

            fillForm(testData);

            // Відправлення форми
            cy.get('#edit-actions-submit').click();

            // Перевірка успішного відправлення
            cy.get('.messages--status, .messages-status')
                .should('be.visible')
                .and('contain.text', 'Форму успішно відправлено!!!');
        });
    });
    */
});
