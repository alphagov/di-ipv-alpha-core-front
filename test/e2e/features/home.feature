@e2e
@home
@happy
Feature: App - visiting the home page
  Background: Goto home page
    Given I am on the home page
  Scenario: Check the title
    Then I see "Start" in title
    And I click "български" button
    Then I see "Започни" in title
    And I click "Cymraeg" button
    Then I see "Dechrau" in title
    And I click "Deutsch" button
    Then I see "Beginnen" in title
    And I click "Español" button
    Then I see "Iniciar" in title
    And I click "Français" button
    Then I see "Commencer" in title
    And I click "Nederlands" button
    Then I see "Starten" in title
    And I click "Polski" button
    Then I see "Początek" in title
    And I click "Română" button
    Then I see "Start" in title
    And I click "English" button
    Then I see "Start" in title
