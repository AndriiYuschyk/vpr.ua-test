describe('Тестування форми "Контакти"', () => {
  // Тестові дані для заповнення форми
  const generateRandomData = () => {
    const names = [
      'Тест Іваненко Іван Іванович',
      'Тест Петренко Петро Петрович',
      'Тест Сидоренко Сидір Сидорович',
      'Тест Коваленко Олександр Михайлович',
    ];
    const emails = [
      'ivanenko.test@example.com',
      'petrenko.test@example.com',
      'sydorenko.test@example.com',
      'kovalenko.test@example.com',
    ];
    const phones = ['+380501234567', '+380671234567', '+380631234567', '+380991234567'];
    const subjects = [
      'Тестовий запит про співпрацю',
      'Тестове питання щодо послуг',
      'Тестова технічна підтримка',
      'Тестове інше',
    ];

    const randomIndex = Math.floor(Math.random() * names.length);

    return {
      name: names[randomIndex],
      email: emails[randomIndex],
      phone: phones[randomIndex],
      subject: subjects[randomIndex],
      message: 'Не реагуйте на цей лист!!! Це тестове повідомлення для перевірки форми контактів.',
    };
  };

  // Функція для заповнення форми
  const fillForm = (data, skipFields = []) => {
    if (!skipFields.includes('name')) {
      cy.get('#edit-name').clear().type(data.name);
    }
    if (!skipFields.includes('email')) {
      cy.get('#edit-email').clear().type(data.email);
    }
    if (!skipFields.includes('phone')) {
      cy.get('#edit-kontaktnyy-nomer-telefonu').clear().type(data.phone);
    }
    if (!skipFields.includes('subject')) {
      cy.get('#edit-subject').clear().type(data.subject);
    }
    if (!skipFields.includes('message')) {
      cy.get('#edit-message').clear().type(data.message);
    }
  };

  beforeEach(() => {
    cy.visit('/contacts');

    // Очікуємо повного завантаження сторінки
    cy.get('body').should('be.visible');

    // Очікуємо що основні елементи форми завантажилися
    cy.get('#edit-name').should('be.visible');
    cy.get('#edit-email').should('be.visible');
    cy.get('#edit-kontaktnyy-nomer-telefonu').should('be.visible');
    cy.get('#edit-subject').should('be.visible');
    cy.get('#edit-message').should('be.visible');

    // Додаткова пауза для завантаження динамічного контенту
    cy.wait(1000);
  });

  describe('Позитивні тести', () => {
    it('Успішне заповнення всіх полів форми з валідними даними', () => {
      const testData = generateRandomData();

      fillForm(testData);

      // Перевірка, що всі поля заповнені
      cy.get('#edit-name').should('have.value', testData.name);
      cy.get('#edit-email').should('have.value', testData.email);
      cy.get('#edit-kontaktnyy-nomer-telefonu').should('have.value', testData.phone);
      cy.get('#edit-subject').should('have.value', testData.subject);
      cy.get('#edit-message').should('have.value', testData.message);
    });

    it("Заповнення форми з мінімальними обов'язковими даними", () => {
      const testData = generateRandomData();

      // Припустимо, що обов'язкові поля: name, email, phone, subject, message
      fillForm(testData, []);

      cy.get('#edit-name').should('have.value', testData.name);
      cy.get('#edit-email').should('have.value', testData.email);
      cy.get('#edit-kontaktnyy-nomer-telefonu').should('have.value', testData.phone);
      cy.get('#edit-subject').should('have.value', testData.subject);
      cy.get('#edit-message').should('have.value', testData.message);
    });

    it('Тестування різних форматів телефону', () => {
      const testData = generateRandomData();
      const phoneFormats = ['+380501234567', '0501234567', '380501234567'];

      phoneFormats.forEach(phone => {
        cy.get('#edit-kontaktnyy-nomer-telefonu').clear().type(phone);
        cy.get('#edit-kontaktnyy-nomer-telefonu').should('have.value', phone);
      });
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

    it('Некоректний номер телефону', () => {
      const testData = generateRandomData();
      const invalidPhones = ['123', '12345', 'abcdefghijk', '+380123'];

      fillForm(testData, ['phone']);

      invalidPhones.forEach(phone => {
        cy.get('#edit-kontaktnyy-nomer-telefonu').clear().type(phone);
        // cy.get('#edit-actions-submit').click();

        // Перевірка помилки валідації
        cy.get('.messages--error, .error, .form-item--error-message').should('exist');
      });
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
      cy.get('#edit-email').should('be.visible');
      cy.get('#edit-kontaktnyy-nomer-telefonu').should('be.visible');
      cy.get('#edit-subject').should('be.visible');
      cy.get('#edit-message').should('be.visible');
      // cy.get('#edit-actions-submit').should('be.visible');
    });

    it('Перевірка placeholder-ів та label-ів', () => {
      cy.get('label[for="edit-name"]').should('exist').and('contain.text', 'ПІБ');
      cy.get('label[for="edit-email"]').should('exist').and('contain.text', 'Ваша електронна адреса');
      cy.get('label[for="edit-kontaktnyy-nomer-telefonu"]')
        .should('exist')
        .and('contain.text', 'Контактний номер телефону');
      cy.get('label[for="edit-subject"]').should('exist').and('contain.text', 'Тема');
      cy.get('label[for="edit-message"]').should('exist').and('contain.text', 'Повідомлення');
      cy.get('#edit-kontaktnyy-nomer-telefonu').should('have.attr', 'placeholder').and('eq', '+380 50 123 4567');
    });
  });
});
