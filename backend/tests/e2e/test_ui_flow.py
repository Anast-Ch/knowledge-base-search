from playwright.sync_api import Page, expect

def test_knowledge_base_e2e_flow(page: Page, create_test_file):
    """Сквозной E2E сценарий: Главная -> Загрузка -> Поиск -> Подсветка текста"""
    test_file_path = create_test_file
    
    # 1. Открываем главную страницу (путь '/' относительно base_url из conftest)
    page.goto("/")
    
    # Проверяем приветственный текст (HomePage.tsx)
    expect(page.locator(".hero-title")).to_contain_text("Поисковая система")
    page.click('button:has-text("НАЧАТЬ")')
    expect(page).to_have_url(r".*/upload$")

    # 2. Страница загрузки (UploadPage.tsx)
    expect(page.locator(".upload-title")).to_contain_text("ЗАГРУЗКА ДОКУМЕНТОВ")
    
    # Перехватываем скрытый инпут в DropZone.tsx
    with page.expect_file_chooser() as fc_info:
        page.click(".drop-zone")
    file_chooser = fc_info.value
    file_chooser.set_files(test_file_path)

    # 3. Валидация списка файлов (FileList.tsx)
    file_item = page.locator(".file-item")
    expect(file_item).to_be_visible()
    expect(file_item.locator(".file-name")).to_have_text("лекция_1.pdf")
    
    # Ожидание изменения статуса на "Готово"
    expect(file_item.locator(".file-status")).to_contain_text("Готово", timeout=5000)

    # 4. Навигация на страницу Поиска через навбар (Navigation.tsx)
    page.click('nav.nav a:has-text("Найти")')
    expect(page).to_have_url("/")

    # 5. Выполнение полнотекстового поиска (DocumentsPage.tsx)
    search_form = page.locator(".search-form")
    search_input = search_form.locator(".search-input")
    
    expect(search_input).to_be_visible()
    search_input.fill("микросервисов")
    search_form.dispatch_event("submit")

    # 6. Проверка результатов поиска и подсветки текста (highlightText)
    result_card = page.locator(".result-card").first
    expect(result_card).to_be_visible()
    
    expect(result_card.locator(".card-filename")).to_contain_text("лекция_1.pdf")
    expect(result_card.locator(".card-meta")).to_contain_text("Страница 12")
    
    # Проверяем, что отработала функция highlightText (класс .highlight из DocumentsPage)
    highlighted_span = result_card.locator(".card-text span.highlight")
    expect(highlighted_span).to_be_visible()
    expect(highlighted_span).to_have_text("микросервисов")