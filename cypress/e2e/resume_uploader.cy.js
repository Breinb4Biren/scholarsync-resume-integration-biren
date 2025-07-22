describe('ResumeUploader E2E', () => {
  it('Uploads a resume and sees results', () => {
    cy.visit('http://localhost:3000');

    cy.get('input[type="file"]').selectFile('cypress/fixtures/sMy_resume.pdf', { force: true });

    cy.contains('Upload & Parse').click();

    cy.contains('Parsing Resume...').should('exist');
    cy.contains('Parsing Resume...').should('not.exist');

    cy.contains('Extracted Resume Text').should('exist');
  });
});
