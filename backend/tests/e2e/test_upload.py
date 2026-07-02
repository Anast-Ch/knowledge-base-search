from playwright.sync_api import expect


from playwright.sync_api import expect


def test_upload_document_flow(app_page, valid_pdf):
    page = app_page

    page.goto("http://localhost:5173/upload")

    # Пользователь видит страницу
    expect(page.get_by_role("heading")).to_have_text("ЗАГРУЗКА ДОКУМЕНТОВ")

    # Список файлов пока отсутствует
    expect(page.locator(".file-list")).to_have_count(0)

    # Загружаем документ
    page.locator("input[type=file]").set_input_files(valid_pdf)

    # Появился список файлов
    expect(page.locator(".file-list")).to_be_visible()

    # Появилось имя файла
    expect(page.locator(".file-name")).to_have_text("valid.pdf")

    # Во время загрузки отображается прогресс
    expect(page.locator(".progress-bar")).to_be_visible()

    # Статус сначала "Загрузка..."
    expect(page.locator(".file-status")).to_contain_text("Загрузка")

    # После завершения индексации
    expect(page.locator(".file-status")).to_have_text(
        "Готово",
        timeout=5000,
    )

    # Прогрессбар исчез
    expect(page.locator(".progress-bar")).to_have_count(0)

    # Кнопка перехода существует
    expect(page.get_by_role("button", name="ГОТОВО")).to_be_visible()